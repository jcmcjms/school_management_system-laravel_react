import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarClock, QrCode, CheckCircle, Clock, XCircle } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData } from '@/types';

interface ReservationItem {
    id: number;
    qr_code: string;
    status: string;
    reserved_pickup_time: string | null;
    redeemed_at: string | null;
    expires_at: string | null;
    created_at: string;
    menu_item: { id: number; name: string; price: number } | null;
    order: { id: number; order_number: string; total: number; status: string; payment_status: string } | null;
}

interface ReservationsPageProps {
    reservations: PaginatedData<ReservationItem>;
}

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    pending: { icon: <Clock className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Pending' },
    confirmed: { icon: <CheckCircle className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Confirmed' },
    redeemed: { icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Redeemed' },
    expired: { icon: <XCircle className="h-4 w-4" />, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Expired' },
    cancelled: { icon: <XCircle className="h-4 w-4" />, color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', label: 'Cancelled' },
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Reservations', href: '/reservations' }];

export default function ReservationsIndex() {
    const { reservations } = usePage<ReservationsPageProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Reservations" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Reservations</h1>
                        <p className="text-muted-foreground">Track your meal reservations and QR codes</p>
                    </div>
                    <Link
                        href="/menu"
                        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <CalendarClock className="mr-2 h-4 w-4" /> New Reservation
                    </Link>
                </div>

                {reservations.data.length === 0 ? (
                    <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
                        <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg text-muted-foreground">No reservations yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Set a pickup time when placing an order to create a reservation with a QR code
                        </p>
                        <Link
                            href="/menu"
                            className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Browse Menu
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reservations.data.map((reservation) => {
                            const cfg = statusConfig[reservation.status] || statusConfig.pending;
                            return (
                                <div key={reservation.id} className="rounded-lg border bg-card shadow-sm transition-all hover:shadow-md">
                                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                        {/* Left: QR Code + info */}
                                        <div className="flex items-start gap-4">
                                            <div className="rounded-lg bg-muted p-3">
                                                <QrCode className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-mono text-sm font-medium">{reservation.qr_code}</p>
                                                {reservation.order && (
                                                    <Link
                                                        href={`/orders/${reservation.order.id}`}
                                                        className="text-sm text-primary hover:underline"
                                                    >
                                                        {reservation.order.order_number}
                                                    </Link>
                                                )}
                                                {reservation.menu_item && (
                                                    <p className="text-sm text-muted-foreground">{reservation.menu_item.name}</p>
                                                )}
                                                <p className="mt-1 text-xs text-muted-foreground">Created {formatDate(reservation.created_at)}</p>
                                            </div>
                                        </div>

                                        {/* Right: status + pickup time */}
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.color}`}>
                                                {cfg.icon} {cfg.label}
                                            </span>
                                            {reservation.reserved_pickup_time && (
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium">Pickup:</span> {reservation.reserved_pickup_time}
                                                </p>
                                            )}
                                            {reservation.redeemed_at && (
                                                <p className="text-xs text-green-600 dark:text-green-400">
                                                    Redeemed {formatDate(reservation.redeemed_at)}
                                                </p>
                                            )}
                                            {reservation.order && (
                                                <p className="text-xs text-muted-foreground">
                                                    ₱{Number(reservation.order.total).toFixed(2)} · {reservation.order.payment_status}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Pagination */}
                        {reservations.last_page > 1 && (
                            <div className="flex justify-center gap-2 pt-4">
                                {Array.from({ length: reservations.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link
                                        key={page}
                                        href={`/reservations?page=${page}`}
                                        className={`rounded-md px-3 py-1 text-sm ${
                                            page === reservations.current_page
                                                ? 'bg-primary text-primary-foreground'
                                                : 'border hover:bg-accent'
                                        }`}
                                    >
                                        {page}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
