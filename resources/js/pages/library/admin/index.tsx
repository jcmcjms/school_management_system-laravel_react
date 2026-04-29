import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type LibraryStats, type LibraryBorrowing } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, CalendarClock, AlertTriangle, Coins, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
    stats: LibraryStats;
    recentBorrowings: LibraryBorrowing[];
    overdueBooks: LibraryBorrowing[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }, { title: 'Library', href: '/library' }];

export default function LibraryAdmin({ stats, recentBorrowings, overdueBooks }: Props) {
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
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_books}</div>
                            <p className="text-xs text-muted-foreground">{stats.available_books} available</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Borrowings</CardTitle>
                            <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_borrowings}</div>
                            <p className="text-xs text-muted-foreground">{stats.pending_reservations} pending reservations</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.overdue_borrowings}</div>
                            <p className="text-xs text-muted-foreground">books overdue</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unpaid Fines</CardTitle>
                            <Coins className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats.unpaid_fines.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">total outstanding</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Overdue Books</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {overdueBooks.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No overdue books</p>
                            ) : (
                                <div className="space-y-3">
                                    {overdueBooks.slice(0, 5).map((borrowing) => (
                                        <div key={borrowing.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{borrowing.book?.title}</p>
                                                    <p className="text-xs text-muted-foreground">{borrowing.user?.name}</p>
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
                            {recentBorrowings.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No recent returns</p>
                            ) : (
                                <div className="space-y-3">
                                    {recentBorrowings.slice(0, 5).map((borrowing) => (
                                        <div key={borrowing.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{borrowing.book?.title}</p>
                                                    <p className="text-xs text-muted-foreground">{borrowing.user?.name}</p>
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
                    <Button asChild className="h-20 flex flex-col items-center justify-center gap-1">
                        <Link href="/library/books">
                            <BookOpen className="h-5 w-5" />
                            <span>Books</span>
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center gap-1">
                        <Link href="/library/borrowings">
                            <CalendarClock className="h-5 w-5" />
                            <span>Borrowings</span>
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center gap-1">
                        <Link href="/library/fines">
                            <Coins className="h-5 w-5" />
                            <span>Fines</span>
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-20 flex flex-col items-center justify-center gap-1">
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