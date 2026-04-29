<?php

namespace App\Http\Controllers;

use App\Models\LibraryBook;
use App\Models\LibraryCategory;
use App\Models\LibraryBorrowing;
use App\Models\LibraryReservation;
use App\Models\LibraryFine;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class LibraryController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        if ($user->isLibrarian()) {
            return $this->librarianDashboard($request);
        }

        return $this->userLibrary($request);
    }

    public function librarianDashboard(Request $request)
    {
        $stats = [
            'total_books' => LibraryBook::count(),
            'available_books' => LibraryBook::where('available_copies', '>', 0)->count(),
            'active_borrowings' => LibraryBorrowing::whereIn('status', ['borrowed', 'overdue'])->count(),
            'pending_reservations' => LibraryReservation::where('status', 'pending')->count(),
            'unpaid_fines' => LibraryFine::where('status', 'pending')->sum('amount'),
            'overdue_borrowings' => LibraryBorrowing::where('status', 'overdue')->count(),
        ];

        $recentBorrowings = LibraryBorrowing::with(['book', 'user'])
            ->latest()
            ->limit(10)
            ->get();

        $recentReturns = LibraryBorrowing::whereNotNull('returned_at')
            ->with(['book', 'user'])
            ->latest('returned_at')
            ->limit(10)
            ->get();

        $recentReturns = LibraryBorrowing::whereNotNull('returned_at')
            ->with(['book', 'user'])
            ->latest('returned_at')
            ->limit(10)
            ->get();

        return inertia('library/index', [
            'stats' => $stats,
            'recentBorrowings' => $recentReturns,
            'overdueBooks' => $this->getOverdueBooks(),
            'is_librarian' => true,
        ]);
    }

    public function userLibrary(Request $request)
    {
        $user = Auth::user();

        $books = LibraryBook::with('category')
            ->when($request->search, fn($q, $search) => $q->where('title', 'like', "%{$search}%")->orWhere('author', 'like', "%{$search}%")->orWhere('isbn', 'like', "%{$search}%"))
            ->when($request->category, fn($q, $cat) => $q->where('category_id', $cat))
            ->where('status', 'available')
            ->paginate(12);

        $categories = LibraryCategory::all();

        $myBorrowings = $user->libraryBorrowings()->with('book')->get();
        $myReservations = $user->libraryReservations()->with('book')->where('status', 'pending')->get();
        $myFines = $user->libraryFines()->where('status', 'pending')->get();

        return inertia('library/index', [
            'books' => $books,
            'categories' => $categories,
            'myBorrowings' => $myBorrowings,
            'myReservations' => $myReservations,
            'myFines' => $myFines,
            'canBorrow' => $user->canBorrowBooks(),
            'hasFines' => $user->hasUnpaidFines(),
        ]);
    }

    public function booksIndex(Request $request)
    {
        $books = LibraryBook::with('category')
            ->when($request->search, fn($q, $search) => $q->where('title', 'like', "%{$search}%")->orWhere('author', 'like', "%{$search}%"))
            ->when($request->category, fn($q, $cat) => $q->where('category_id', $cat))
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(15);

        $categories = LibraryCategory::all();

        return inertia('library/books/index', [
            'books' => $books,
            'categories' => $categories,
        ]);
    }

    public function booksStore(Request $request)
    {
        $validated = $request->validate([
            'isbn' => 'required|string|unique:library_books,isbn',
            'title' => 'required|string',
            'author' => 'required|string',
            'publisher' => 'nullable|string',
            'published_year' => 'nullable|integer|min:1000|max:' . date('Y'),
            'category_id' => 'nullable|exists:library_categories,id',
            'description' => 'nullable|string',
            'total_copies' => 'required|integer|min:1',
            'location' => 'nullable|string',
        ]);

        $validated['available_copies'] = $validated['total_copies'];

        LibraryBook::create($validated);

        return back()->with('success', 'Book added successfully');
    }

    public function booksUpdate(Request $request, LibraryBook $book)
    {
        $validated = $request->validate([
            'isbn' => ['required', 'string', Rule::unique('library_books')->ignore($book->id)],
            'title' => 'required|string',
            'author' => 'required|string',
            'publisher' => 'nullable|string',
            'published_year' => 'nullable|integer|min:1000|max:' . date('Y'),
            'category_id' => 'nullable|exists:library_categories,id',
            'description' => 'nullable|string',
            'total_copies' => 'required|integer|min:1',
            'location' => 'nullable|string',
            'status' => 'required|in:available,unavailable,archived',
        ]);

        $oldTotal = $book->total_copies;
        $book->update($validated);

        if ($validated['total_copies'] > $oldTotal) {
            $book->increment('available_copies', $validated['total_copies'] - $oldTotal);
        }

        return back()->with('success', 'Book updated successfully');
    }

    public function booksDestroy(LibraryBook $book)
    {
        if ($book->borrowings()->whereIn('status', ['borrowed', 'overdue'])->exists()) {
            return back()->with('error', 'Cannot delete book with active borrowings');
        }

        $book->delete();

        return back()->with('success', 'Book deleted successfully');
    }

    public function borrow(Request $request)
    {
        $user = Auth::user();

        if (!$user->canBorrowBooks()) {
            return back()->with('error', 'You have reached your borrowing limit');
        }

        if ($user->hasUnpaidFines()) {
            return back()->with('error', 'You have unpaid fines. Please settle them first');
        }

        $request->validate(['book_id' => 'required|exists:library_books,id']);

        $book = LibraryBook::findOrFail($request->book_id);

        if (!$book->canBorrow()) {
            return back()->with('error', 'Book is not available for borrowing');
        }

        $borrowing = $book->borrow($user);

        return back()->with('success', 'Book borrowed successfully. Due date: ' . $borrowing->due_date->format('M d, Y'));
    }

    public function return(Request $request)
    {
        $request->validate(['borrowing_id' => 'required|exists:library_borrowings,id']);

        $borrowing = LibraryBorrowing::findOrFail($request->borrowing_id);

        if ($borrowing->user_id !== Auth::id() && !Auth::user()->isLibrarian()) {
            return back()->with('error', 'Unauthorized');
        }

        $borrowing->markReturned();

        $fineAmount = $borrowing->calculateFine();
        if ($fineAmount > 0) {
            LibraryFine::create([
                'borrowing_id' => $borrowing->id,
                'user_id' => $borrowing->user_id,
                'amount' => $fineAmount,
                'reason' => 'Late return penalty',
            ]);
        }

        return back()->with('success', 'Book returned successfully' . ($fineAmount > 0 ? '. Fine applied: $' . number_format($fineAmount, 2) : ''));
    }

    public function reserve(Request $request)
    {
        $user = Auth::user();

        if ($user->pendingReservations()->count() >= config('library.max_reservations', 2)) {
            return back()->with('error', 'You have reached your reservation limit');
        }

        $request->validate(['book_id' => 'required|exists:library_books,id']);

        $book = LibraryBook::findOrFail($request->book_id);

        if ($book->available_copies > 0) {
            return back()->with('error', 'Book is available. You can borrow directly');
        }

        $existingReservation = $user->libraryReservations()
            ->where('book_id', $book->id)
            ->where('status', 'pending')
            ->exists();

        if ($existingReservation) {
            return back()->with('error', 'You already have a reservation for this book');
        }

        $book->reservations()->create([
            'user_id' => $user->id,
            'reserved_at' => now(),
            'expires_at' => now()->addDays(config('library.reservation_days', 3)),
            'status' => 'pending',
        ]);

        return back()->with('success', 'Book reserved successfully');
    }

    public function cancelReservation(LibraryReservation $reservation)
    {
        if ($reservation->user_id !== Auth::id() && !Auth::user()->isLibrarian()) {
            return back()->with('error', 'Unauthorized');
        }

        $reservation->cancel();

        return back()->with('success', 'Reservation cancelled');
    }

    public function borrowingsIndex(Request $request)
    {
        $borrowings = LibraryBorrowing::with(['book', 'user'])
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->user_id, fn($q, $userId) => $q->where('user_id', $userId))
            ->latest()
            ->paginate(15);

        return inertia('library/borrowings/index', [
            'borrowings' => $borrowings,
        ]);
    }

    public function updateBorrowingStatus(Request $request, LibraryBorrowing $borrowing)
    {
        $request->validate([
            'status' => 'required|in:borrowed,returned,overdue,lost',
        ]);

        if ($request->status === 'returned') {
            $borrowing->markReturned();
            $fineAmount = $borrowing->calculateFine();
            if ($fineAmount > 0) {
                LibraryFine::create([
                    'borrowing_id' => $borrowing->id,
                    'user_id' => $borrowing->user_id,
                    'amount' => $fineAmount,
                    'reason' => 'Late return penalty',
                ]);
            }
        } elseif ($request->status === 'lost') {
            $borrowing->markLost();
        } else {
            $borrowing->update(['status' => $request->status]);
        }

        return back()->with('success', 'Borrowing status updated');
    }

    public function finesIndex(Request $request)
    {
        $fines = LibraryFine::with(['borrowing.book', 'user'])
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->user_id, fn($q, $userId) => $q->where('user_id', $userId))
            ->latest()
            ->paginate(15);

        return inertia('library/fines/index', [
            'fines' => $fines,
        ]);
    }

    public function payFine(LibraryFine $fine)
    {
        if (Auth::id() !== $fine->user_id && !Auth::user()->isLibrarian()) {
            return back()->with('error', 'Unauthorized');
        }

        $fine->markPaid();

        return back()->with('success', 'Fine paid successfully');
    }

    public function waiveFine(LibraryFine $fine)
    {
        if (!Auth::user()->isLibrarian()) {
            return back()->with('error', 'Unauthorized');
        }

        $fine->waive();

        return back()->with('success', 'Fine waived');
    }

    public function categoriesIndex()
    {
        $categories = LibraryCategory::with('children')->whereNull('parent_id')->get();

        return inertia('library/categories/index', [
            'categories' => $categories,
        ]);
    }

    public function categoriesStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:library_categories,id',
        ]);

        LibraryCategory::create($validated);

        return back()->with('success', 'Category created');
    }

    public function categoriesUpdate(Request $request, LibraryCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:library_categories,id',
        ]);

        $category->update($validated);

        return back()->with('success', 'Category updated');
    }

    public function categoriesDestroy(LibraryCategory $category)
    {
        if ($category->books()->exists()) {
            return back()->with('error', 'Cannot delete category with books');
        }

        $category->delete();

        return back()->with('success', 'Category deleted');
    }

    public function reports()
    {
        $monthlyStats = LibraryBorrowing::selectRaw('MONTH(borrowed_at) as month, COUNT(*) as count')
            ->whereYear('borrowed_at', date('Y'))
            ->groupBy('month')
            ->get();

        $topBooks = LibraryBook::withCount('borrowings')
            ->orderByDesc('borrowings_count')
            ->limit(10)
            ->get();

        $userStats = User::whereIn('role', ['student', 'faculty'])
            ->withCount('libraryBorrowings')
            ->orderByDesc('library_borrowings_count')
            ->limit(10)
            ->get();

        return inertia('library/reports', [
            'monthlyStats' => $monthlyStats,
            'topBooks' => $topBooks,
            'topUsers' => $userStats,
        ]);
    }

    private function getOverdueBooks()
    {
        return LibraryBorrowing::with(['book', 'user'])
            ->where('status', 'overdue')
            ->orWhere(function ($q) {
                $q->where('status', 'borrowed')->where('due_date', '<', now());
            })
            ->get()
            ->map(function ($b) {
                if ($b->status === 'borrowed' && $b->due_date->isPast()) {
                    $b->status = 'overdue';
                    $b->save();
                }
                return $b;
            });
    }
}