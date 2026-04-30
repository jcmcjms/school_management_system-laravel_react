import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type LibraryFine, type PaginatedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Coins } from 'lucide-react';
import { useState } from 'react';

interface Props {
    fines: PaginatedData<LibraryFine>;
    filters?: {
        status?: string;
    };
}

const breadcrumbs = [
    { title: 'Library', href: '/library' },
    { title: 'Fines', href: '/library/fines' },
];

export default function LibraryFinesIndex({ fines, filters = {} }: Props) {
    const { props } = usePage();
    const csrfToken = (props as any).csrf_token as string;
    const [status, setStatus] = useState(filters.status || '0');

    const handleStatusFilter = (value: string) => {
        setStatus(value);
        router.get(`/library/fines`, { status: value && value !== '0' ? value : undefined }, { preserveState: true });
    };

    const handlePay = (fineId: number) => {
        router.patch(`/library/fines/${fineId}/pay`, {}, { headers: { 'X-CSRF-TOKEN': csrfToken } });
    };

    const handleWaive = (fineId: number) => {
        router.patch(`/library/fines/${fineId}/waive`, {}, { headers: { 'X-CSRF-TOKEN': csrfToken } });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fines" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Fines Management</h1>
                        <p className="text-muted-foreground">Track and manage library fines</p>
                    </div>
                    <Select value={status} onValueChange={handleStatusFilter}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">All</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="waived">Waived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <table className="w-full">
                            <thead className="border-b">
                                <tr className="text-left">
                                    <th className="p-4 font-medium">User</th>
                                    <th className="p-4 font-medium">Book</th>
                                    <th className="p-4 font-medium">Amount</th>
                                    <th className="p-4 font-medium">Reason</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium">Created</th>
                                    <th className="p-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fines.data.map((fine) => (
                                    <tr key={fine.id} className="border-b">
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium">{fine.user?.name}</p>
                                                <p className="text-muted-foreground text-xs">{fine.user?.role}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium">{fine.borrowing?.book?.title}</p>
                                                <p className="text-muted-foreground text-xs">
                                                    Borrowed: {new Date(fine.borrowing?.borrowed_at || '').toLocaleDateString()}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium">${fine.amount.toFixed(2)}</td>
                                        <td className="p-4">{fine.reason || '-'}</td>
                                        <td className="p-4">
                                            <Badge
                                                variant={fine.status === 'paid' ? 'default' : fine.status === 'waived' ? 'outline' : 'destructive'}
                                            >
                                                {fine.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4">{new Date(fine.created_at).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            {fine.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => handlePay(fine.id)}>
                                                        Pay
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => handleWaive(fine.id)}>
                                                        Waive
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {fines.data.length === 0 && (
                            <div className="py-8 text-center">
                                <Coins className="text-muted-foreground mx-auto mb-2 h-12 w-12" />
                                <p className="text-muted-foreground">No fines found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {fines.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: fines.last_page }, (_, i) => (
                            <Button
                                key={i}
                                variant={fines.current_page === i + 1 ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => (window.location.href = `/library/fines?page=${i + 1}`)}
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
