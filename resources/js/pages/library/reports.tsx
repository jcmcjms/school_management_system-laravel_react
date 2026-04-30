import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type LibraryBook, type User } from '@/types';
import { Head } from '@inertiajs/react';
import { BarChart3, BookOpen, Users } from 'lucide-react';

interface Props {
    monthlyStats: { month: number; count: number }[];
    topBooks: LibraryBook[];
    topUsers: User[];
}

const breadcrumbs = [
    { title: 'Library', href: '/library' },
    { title: 'Reports', href: '/library/reports' },
];

export default function LibraryReports({ monthlyStats, topBooks, topUsers }: Props) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const maxCount = Math.max(...monthlyStats.map((m) => m.count), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Library Reports" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Library Reports</h1>
                    <p className="text-muted-foreground">Analytics and insights for library operations</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BarChart3 className="h-5 w-5" />
                            Monthly Borrowing Trends
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-40 items-end gap-1">
                            {months.map((month, i) => {
                                const stat = monthlyStats.find((m) => m.month === i + 1);
                                const count = stat?.count || 0;
                                const height = (count / maxCount) * 100;
                                return (
                                    <div key={month} className="flex flex-1 flex-col items-center gap-1">
                                        <div
                                            className="bg-primary w-full rounded-t"
                                            style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                                        />
                                        <span className="text-muted-foreground text-xs">{month}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BookOpen className="h-5 w-5" />
                                Most Borrowed Books
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {topBooks.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No data available</p>
                            ) : (
                                <div className="space-y-3">
                                    {topBooks.map((book, index) => (
                                        <div key={book.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-muted-foreground w-6 text-lg font-bold">{index + 1}</span>
                                                <div>
                                                    <p className="font-medium">{book.title}</p>
                                                    <p className="text-muted-foreground text-sm">{book.author}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium">{(book as any).borrowings_count} borrows</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Users className="h-5 w-5" />
                                Top Borrowers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {topUsers.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No data available</p>
                            ) : (
                                <div className="space-y-3">
                                    {topUsers.map((user, index) => (
                                        <div key={user.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-muted-foreground w-6 text-lg font-bold">{index + 1}</span>
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-muted-foreground text-sm capitalize">{user.role}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium">{(user as any).library_borrowings_count} books</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
