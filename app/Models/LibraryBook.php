<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LibraryBook extends Model
{
    use HasFactory;

    protected $fillable = [
        'isbn', 'title', 'author', 'publisher', 'published_year',
        'category_id', 'description', 'cover_image', 'total_copies',
        'available_copies', 'location', 'status'
    ];

    protected function casts(): array
    {
        return [
            'published_year' => 'integer',
            'total_copies' => 'integer',
            'available_copies' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(LibraryCategory::class, 'category_id');
    }

    public function borrowings(): HasMany
    {
        return $this->hasMany(LibraryBorrowing::class, 'book_id');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(LibraryReservation::class, 'book_id');
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available' && $this->available_copies > 0;
    }

    public function canBorrow(): bool
    {
        return $this->isAvailable();
    }

    public function borrow(User $user): ?LibraryBorrowing
    {
        if (!$this->canBorrow()) {
            return null;
        }

        $borrowing = $this->borrowings()->create([
            'user_id' => $user->id,
            'borrowed_at' => now()->toDateString(),
            'due_date' => now()->addDays(config('library.borrow_days', 7))->toDateString(),
            'status' => 'borrowed',
        ]);

        $this->decrement('available_copies');

        return $borrowing;
    }

    public function returnBook(): bool
    {
        $this->increment('available_copies');
        return true;
    }
}