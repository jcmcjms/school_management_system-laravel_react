import AppLayout from '@/layouts/app-layout';
import { type LibraryBorrowing, type PaginatedData } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { CalendarClock, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface Props {
    borrowings: PaginatedData<LibraryBorrowing>;
    filters?: {
        status?: string;
    };
}

const breadcrumbs = [{ title: 'Library', href: '/library' }, { title: 'Borrowings', href: '/library/borrowings' }];

export default function LibraryBorrowingsIndex({ borrowings, filters = {} }: Props) {
    const { props } = usePage();
    const csrfToken = (props as any).csrf_token as string;
    const [status, setStatus] = useState(filters?.status || '0');

    const handleStatusFilter = (value: string) => {
        setStatus(value);
        router.get(`/library/borrowings`, { status: value && value !== '0' ? value : undefined }, { preserveState: true });
    };

    const handleUpdateStatus = (borrowingId: number, newStatus: string) => {
        router.patch(`/library/borrowings/${borrowingId}/status`, 
            { status: newStatus },
            { headers: { 'X-CSRF-TOKEN': csrfToken } }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Borrowings" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Borrowings</h1>
                        <p className="text-muted-foreground">Manage book borrowings and returns</p>
                    </div>
                    <Select value={status} onValueChange={handleStatusFilter}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">All</SelectItem>
                            <SelectItem value="borrowed">Borrowed</SelectItem>
                            <SelectItem value="returned">Returned</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <table className="w-full">
                            <thead className="border-b">
                                <tr className="text-left">
                                    <th className="p-4 font-medium">Book</th>
                                    <th className="p-4 font-medium">User</th>
                                    <th className="p-4 font-medium">Borrowed</th>
                                    <th className="p-4 font-medium">Due Date</th>
                                    <th className="p-4 font-medium">Returned</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {borrowings.data.map((b) => (
                                    <tr key={b.id} className="border-b">
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium">{b.book?.title}</p>
                                                <p className="text-xs text-muted-foreground">{b.book?.isbn}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium">{b.user?.name}</p>
                                                <p className="text-xs text-muted-foreground">{b.user?.role}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">{new Date(b.borrowed_at).toLocaleDateString()}</td>
                                        <td className="p-4">{new Date(b.due_date).toLocaleDateString()}</td>
                                        <td className="p-4">{b.returned_at ? new Date(b.returned_at).toLocaleDateString() : '-'}</td>
                                        <td className="p-4">
                                            <Badge variant={
                                                b.status === 'returned' ? 'outline' :
                                                b.status === 'overdue' ? 'destructive' :
                                                b.status === 'lost' ? 'secondary' : 'default'
                                            }>
                                                {b.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            {b.status !== 'returned' && (
                                                <div className="flex gap-2">
                                                    {b.status === 'borrowed' && new Date(b.due_date) < new Date() && (
                                                        <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(b.id, 'overdue')}>
                                                            Mark Overdue
                                                        </Button>
                                                    )}
                                                    <Button size="sm" onClick={() => handleUpdateStatus(b.id, 'returned')}>
                                                        <RotateCcw className="h-4 w-4 mr-1" />
                                                        Return
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {borrowings.data.length === 0 && (
                            <div className="text-center py-8">
                                <CalendarClock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground">No borrowings found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {borrowings.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: borrowings.last_page }, (_, i) => (
                            <Button key={i} variant={borrowings.current_page === i + 1 ? 'default' : 'outline'} size="sm" onClick={() => window.location.href = `/library/borrowings?page=${i + 1}`}>
                                {i + 1}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}