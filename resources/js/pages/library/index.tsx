import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type LibraryBook, type LibraryBorrowing, type LibraryCategory, type LibraryFine, type LibraryReservation, type LibraryStats } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, BookOpen, CalendarClock, Clock, Coins, Users } from 'lucide-react';
import { useState } from 'react';

interface Props {
    books?: {
        data: LibraryBook[];
        current_page: number;
        last_page: number;
        total: number;
    };
    categories?: LibraryCategory[];
    myBorrowings?: LibraryBorrowing[];
    myReservations?: LibraryReservation[];
    myFines?: LibraryFine[];
    canBorrow?: boolean;
    hasFines?: boolean;
    stats?: LibraryStats;
    recentBorrowings?: LibraryBorrowing[];
    overdueBooks?: LibraryBorrowing[];
    is_librarian?: boolean;
}

const breadcrumbs = [{ title: 'Library', href: '/library' }];

export default function LibraryIndex({
    books,
    categories,
    myBorrowings,
    myReservations,
    myFines,
    canBorrow,
    hasFines,
    stats,
    recentBorrowings,
    overdueBooks,
    is_librarian,
}: Props) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');

    if (is_librarian && stats) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Library Dashboard" />
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">Library Dashboard</h1>
                            <p className="text-muted-foreground">Manage books, borrowings, and library operations</p>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href="/library/books">Manage Books</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/library/reports">Reports</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                                <BookOpen className="text-muted-foreground h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_books}</div>
                                <p className="text-muted-foreground text-xs">{stats.available_books} available</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Borrowings</CardTitle>
                                <CalendarClock className="text-muted-foreground h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.active_borrowings}</div>
                                <p className="text-muted-foreground text-xs">{stats.pending_reservations} pending reservations</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                                <AlertTriangle className="text-muted-foreground h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.overdue_borrowings}</div>
                                <p className="text-muted-foreground text-xs">books overdue</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Unpaid Fines</CardTitle>
                                <Coins className="text-muted-foreground h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${stats.unpaid_fines.toFixed(2)}</div>
                                <p className="text-muted-foreground text-xs">total outstanding</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Overdue Books</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {overdueBooks?.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">No overdue books</p>
                                ) : (
                                    <div className="space-y-3">
                                        {overdueBooks?.slice(0, 5).map((borrowing) => (
                                            <div key={borrowing.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-muted flex h-10 w-10 items-center justify-center rounded">
                                                        <BookOpen className="text-muted-foreground h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{borrowing.book?.title}</p>
                                                        <p className="text-muted-foreground text-xs">{borrowing.user?.name}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="destructive">Overdue</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Recent Returns</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentBorrowings?.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">No recent returns</p>
                                ) : (
                                    <div className="space-y-3">
                                        {recentBorrowings?.slice(0, 5).map((borrowing) => (
                                            <div key={borrowing.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-muted flex h-10 w-10 items-center justify-center rounded">
                                                        <BookOpen className="text-muted-foreground h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{borrowing.book?.title}</p>
                                                        <p className="text-muted-foreground text-xs">{borrowing.user?.name}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline">Returned</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        <Button asChild className="flex h-20 flex-col items-center justify-center gap-1">
                            <Link href="/library/books">
                                <BookOpen className="h-5 w-5" />
                                <span>Books</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="flex h-20 flex-col items-center justify-center gap-1">
                            <Link href="/library/borrowings">
                                <CalendarClock className="h-5 w-5" />
                                <span>Borrowings</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="flex h-20 flex-col items-center justify-center gap-1">
                            <Link href="/library/fines">
                                <Coins className="h-5 w-5" />
                                <span>Fines</span>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="flex h-20 flex-col items-center justify-center gap-1">
                            <Link href="/library/categories">
                                <Users className="h-5 w-5" />
                                <span>Categories</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/library', { search: search || undefined, category: category || undefined }, { preserveState: true });
    };

    const handleBorrow = (bookId: number) => {
        router.post('/library/borrow', { book_id: bookId });
    };

    const handleReserve = (bookId: number) => {
        router.post('/library/reserve', { book_id: bookId });
    };

    const handleReturn = (borrowingId: number) => {
        router.post('/library/return', { borrowing_id: borrowingId });
    };

    const handleCancelReservation = (reservationId: number) => {
        router.delete(`/library/reservations/${reservationId}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Library" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Library</h1>
                    <p className="text-muted-foreground">Browse and borrow books from our collection</p>
                </div>

                {hasFines && (
                    <Card className="border-destructive">
                        <CardContent className="pt-4">
                            <div className="text-destructive flex items-center gap-2">
                                <Coins className="h-5 w-5" />
                                <span className="font-medium">You have unpaid fines. Please settle them to borrow books.</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CalendarClock className="h-5 w-5" />
                                My Borrowings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {myBorrowings?.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No active borrowings</p>
                            ) : (
                                <div className="space-y-3">
                                    {myBorrowings?.map((b) => (
                                        <div key={b.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">{b.book?.title}</p>
                                                <p className="text-muted-foreground text-xs">Due: {new Date(b.due_date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Badge variant={b.status === 'overdue' ? 'destructive' : 'default'}>{b.status}</Badge>
                                                <Button size="sm" variant="outline" onClick={() => handleReturn(b.id)}>
                                                    Return
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="h-5 w-5" />
                                My Reservations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {myReservations?.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No active reservations</p>
                            ) : (
                                <div className="space-y-3">
                                    {myReservations?.map((r) => (
                                        <div key={r.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">{r.book?.title}</p>
                                                <p className="text-muted-foreground text-xs">
                                                    Expires: {new Date(r.expires_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Button size="sm" variant="outline" onClick={() => handleCancelReservation(r.id)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Coins className="h-5 w-5" />
                                My Fines
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {myFines?.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No pending fines</p>
                            ) : (
                                <div className="space-y-3">
                                    {myFines?.map((f) => (
                                        <div key={f.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">${f.amount.toFixed(2)}</p>
                                                <p className="text-muted-foreground text-xs">{f.reason}</p>
                                            </div>
                                            <Button size="sm" onClick={() => router.patch(`/library/fines/${f.id}/pay`)}>
                                                Pay
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Browse Books</CardTitle>
                        <form onSubmit={handleSearch} className="mt-4 flex gap-4">
                            <div className="relative flex-1">
                                <Input placeholder="Search by title, author, or ISBN..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Categories</SelectItem>
                                    {categories?.map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="submit">Search</Button>
                        </form>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {books?.data.map((book) => (
                                <div key={book.id} className="space-y-2 rounded-lg border p-4">
                                    <div className="bg-muted flex aspect-[3/4] items-center justify-center rounded">
                                        <BookOpen className="text-muted-foreground h-12 w-12" />
                                    </div>
                                    <div>
                                        <h3 className="line-clamp-2 font-medium">{book.title}</h3>
                                        <p className="text-muted-foreground text-sm">{book.author}</p>
                                        <p className="text-muted-foreground text-xs">ISBN: {book.isbn}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Badge variant={book.available_copies > 0 ? 'default' : 'secondary'}>{book.available_copies} available</Badge>
                                    </div>
                                    <div className="flex gap-2">
                                        {!canBorrow || hasFines ? (
                                            <Button size="sm" variant="outline" disabled className="flex-1">
                                                Unavailable
                                            </Button>
                                        ) : book.available_copies > 0 ? (
                                            <Button size="sm" className="flex-1" onClick={() => handleBorrow(book.id)}>
                                                Borrow
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleReserve(book.id)}>
                                                Reserve
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {books?.data.length === 0 && (
                            <div className="py-8 text-center">
                                <BookOpen className="text-muted-foreground mx-auto mb-2 h-12 w-12" />
                                <p className="text-muted-foreground">No books found</p>
                            </div>
                        )}

                        {books && books.last_page > 1 && (
                            <div className="mt-4 flex justify-center gap-2">
                                {Array.from({ length: books.last_page }, (_, i) => (
                                    <Button
                                        key={i}
                                        variant={books.current_page === i + 1 ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => router.get(`/library?page=${i + 1}`, {}, { preserveState: true })}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
