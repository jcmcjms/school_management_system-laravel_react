import { Head, Link, router, usePage } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, CheckCircle, Clock, XCircle, Ban } from 'lucide-react';
import { useState, useEffect } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Order } from '@/types';

interface OrderShowProps {
    order: Order;
    flash?: { success?: string };
}

const formatPrice = (price: number | string): string => Number(price).toFixed(2);
const formatDate = (d: string): string => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    preparing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    ready: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    served: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const paymentStatusIcons: Record<string, React.ReactNode> = {
    paid: <CheckCircle className="h-5 w-5 text-green-600" />,
    pending: <Clock className="h-5 w-5 text-yellow-600" />,
    failed: <XCircle className="h-5 w-5 text-red-600" />,
};

const statusTimeline = ['pending', 'confirmed', 'preparing', 'ready', 'served'];

export default function OrderShow() {
    const { order, flash } = usePage<OrderShowProps>().props;
    const [cancelling, setCancelling] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'My Orders', href: '/orders' },
        { title: order.order_number, href: `/orders/${order.id}` },
    ];

    const canCancel = order.status === 'pending' && order.payment_status !== 'paid';
    const currentStep = statusTimeline.indexOf(order.status);

    // Auto-refresh order status every 30s for active orders
    useEffect(() => {
        if (['served', 'cancelled'].includes(order.status)) return;
        const id = setInterval(() => {
            router.reload({ only: ['order'] });
        }, 30000);
        return () => clearInterval(id);
    }, [order.status]);

    const handleCancel = () => {
        setCancelling(true);
        router.patch(`/orders/${order.id}/cancel`, {}, {
            onFinish: () => { setCancelling(false); setShowCancelConfirm(false); },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order ${order.order_number}`} />
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Flash message */}
                {(flash as any)?.success && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                        <CheckCircle className="h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium">{(flash as any).success}</p>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/orders" className="rounded-md border p-2 hover:bg-accent">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{order.order_number}</h1>
                        <p className="text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                    <span className={`ml-auto rounded-full px-3 py-1 text-sm font-medium ${statusColors[order.status] || ''}`}>
                        {order.status}
                    </span>
                </div>

                {/* Status Timeline (non-cancelled orders) */}
                {order.status !== 'cancelled' && (
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold">Order Progress</h2>
                        <div className="flex items-center justify-between">
                            {statusTimeline.map((step, i) => {
                                const isActive = i <= currentStep;
                                const isCurrent = i === currentStep;
                                return (
                                    <div key={step} className="flex flex-1 items-center">
                                        <div className="flex flex-col items-center">
                                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                                isCurrent ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                                                isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                            }`}>
                                                {isActive ? '✓' : i + 1}
                                            </div>
                                            <span className={`mt-2 text-xs capitalize ${isCurrent ? 'font-bold text-primary' : isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {step}
                                            </span>
                                        </div>
                                        {i < statusTimeline.length - 1 && (
                                            <div className={`mx-2 h-0.5 flex-1 ${i < currentStep ? 'bg-primary' : 'bg-muted'}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Cancelled banner */}
                {order.status === 'cancelled' && (
                    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                        <Ban className="h-6 w-6 text-red-600" />
                        <div>
                            <p className="font-medium text-red-800 dark:text-red-200">This order has been cancelled</p>
                            <p className="text-sm text-red-600 dark:text-red-400">No further action is needed.</p>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        {/* Items */}
                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                            <h2 className="mb-4 text-xl font-semibold">Order Items</h2>
                            <div className="space-y-3">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                        <div>
                                            <p className="font-medium">{item.menuItem?.name || item.menu_item?.name}</p>
                                            <p className="text-sm text-muted-foreground">{item.quantity} × ₱{formatPrice(item.unit_price)}</p>
                                        </div>
                                        <p className="font-medium">₱{formatPrice(item.subtotal)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 border-t pt-4 flex justify-between text-lg font-bold">
                                <span>Total</span><span>₱{formatPrice(order.total)}</span>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                            <h2 className="mb-4 text-xl font-semibold">Payment</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Method</span>
                                    <span className="font-medium capitalize">{order.payment_method?.replace('_', ' ') || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <div className="flex items-center gap-2">
                                        {paymentStatusIcons[order.payment_status]}
                                        <span className="font-medium capitalize">{order.payment_status}</span>
                                    </div>
                                </div>
                                {order.payment_status === 'pending' && order.payment_method !== 'salary_deduction' && (
                                    <div className="mt-3 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                        💡 Please proceed to the cashier to complete your payment.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cancel Order */}
                        {canCancel && (
                            <div className="rounded-lg border border-red-200 bg-card p-6 shadow-sm dark:border-red-800">
                                {!showCancelConfirm ? (
                                    <button
                                        onClick={() => setShowCancelConfirm(true)}
                                        className="flex w-full items-center justify-center gap-2 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
                                    >
                                        <Ban className="h-4 w-4" /> Cancel Order
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-red-800 dark:text-red-200">Are you sure you want to cancel this order?</p>
                                        <p className="text-xs text-muted-foreground">This action cannot be undone. Stock will be restored.</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleCancel}
                                                disabled={cancelling}
                                                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                                            </button>
                                            <button
                                                onClick={() => setShowCancelConfirm(false)}
                                                className="flex-1 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
                                            >
                                                Keep Order
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* QR Code & Reservation */}
                    <div className="space-y-4">
                        {order.reservation && (
                            <div className="rounded-lg border bg-card p-6 shadow-sm text-center">
                                <h2 className="mb-4 text-xl font-semibold">Your QR Code</h2>
                                <div className="inline-block rounded-lg bg-white p-4">
                                    <QRCodeSVG value={order.reservation.qr_code} size={200} level="H" />
                                </div>
                                <p className="mt-3 font-mono text-sm text-muted-foreground">{order.reservation.qr_code}</p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Pickup: {order.reservation.reserved_pickup_time}
                                </p>
                                <div className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.reservation.status] || 'bg-gray-100'}`}>
                                    {order.reservation.status}
                                </div>
                                {order.reservation.status === 'pending' && (
                                    <p className="mt-3 text-xs text-muted-foreground">
                                        Show this QR code to staff at the pickup counter
                                    </p>
                                )}
                            </div>
                        )}

                        {order.notes && (
                            <div className="rounded-lg border bg-card p-6 shadow-sm">
                                <h2 className="mb-2 text-xl font-semibold">Notes</h2>
                                <p className="text-muted-foreground">{order.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
