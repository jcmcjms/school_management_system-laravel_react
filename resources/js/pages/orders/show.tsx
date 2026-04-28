import { Head, usePage } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Order } from '@/types';

interface OrderShowProps {
    order: Order;
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

export default function OrderShow() {
    const { order } = usePage<OrderShowProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'My Orders', href: '/orders' },
        { title: order.order_number, href: `/orders/${order.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order ${order.order_number}`} />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <a href="/orders" className="rounded-md border p-2 hover:bg-accent"><ArrowLeft className="h-4 w-4" /></a>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{order.order_number}</h1>
                        <p className="text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                    <span className={`ml-auto rounded-full px-3 py-1 text-sm font-medium ${statusColors[order.status] || ''}`}>{order.status}</span>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        {/* Items */}
                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                            <h2 className="mb-4 text-xl font-semibold">Order Items</h2>
                            <div className="space-y-3">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between border-b pb-3">
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
                                        Please proceed to the cashier to complete your payment.
                                    </div>
                                )}
                            </div>
                        </div>
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
