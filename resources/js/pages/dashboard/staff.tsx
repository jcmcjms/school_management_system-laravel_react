import { Head, router, usePage } from '@inertiajs/react';
import { Package, Check, Clock, AlertTriangle, QrCode, DollarSign } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface OrderItemMenuItem { id: number; name: string }
interface OrderItem { id: number; quantity: number; unit_price: number; subtotal: number; menuItem: OrderItemMenuItem }
interface OrderUser { id: number; name: string }
interface Order { id: number; order_number: string; total: number; status: string; payment_method: string | null; payment_status: string; created_at: string; user: OrderUser; items: OrderItem[] }
interface InventoryItem { id: number; name: string; current_quantity: number; minimum_quantity: number }
interface StatusCounts { pending: number; preparing: number; ready: number; served: number }
interface StaffDashboardProps { orders: Order[]; preparingOrders: Order[]; readyOrders: Order[]; lowStockInventory: InventoryItem[]; statusCounts: StatusCounts }

const formatPrice = (p: number | string) => Number(p).toFixed(2);
const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/staff/dashboard' }];

export default function StaffDashboard() {
    const { orders, preparingOrders, readyOrders, lowStockInventory, statusCounts } = usePage<StaffDashboardProps>().props;
    const [qrCode, setQrCode] = useState('');
    const [qrError, setQrError] = useState('');
    const [showPayment, setShowPayment] = useState<Order | null>(null);
    const [gcashRef, setGcashRef] = useState('');
    const [cashReceived, setCashReceived] = useState('');

    const updateStatus = (orderId: number, newStatus: string) => {
        router.patch(`/staff/orders/${orderId}/status`, { status: newStatus }, { preserveScroll: true });
    };

    const handleRedeemQR = (e: React.FormEvent) => {
        e.preventDefault();
        setQrError('');
        router.post('/staff/reservations/redeem', { qr_code: qrCode }, {
            preserveScroll: true,
            onError: (errs) => setQrError((errs as any).qr_code || 'Invalid QR code'),
            onSuccess: () => setQrCode(''),
        });
    };

    const handleConfirmPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!showPayment) return;
        router.post(`/staff/orders/${showPayment.id}/confirm-payment`, {
            gcash_reference: gcashRef || null,
            cash_received: cashReceived ? parseFloat(cashReceived) : null,
        }, {
            preserveScroll: true,
            onSuccess: () => { setShowPayment(null); setGcashRef(''); setCashReceived(''); },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Dashboard - Kitchen" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Kitchen Dashboard</h1>
                        <p className="text-muted-foreground">Manage orders and preparation</p>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-6 shadow-sm dark:bg-yellow-950">
                        <div className="flex items-center justify-between">
                            <div><p className="text-sm font-medium text-yellow-700">New Orders</p><p className="text-3xl font-bold text-yellow-700">{statusCounts.pending}</p></div>
                            <div className="rounded-full bg-yellow-500/10 p-3"><Clock className="h-5 w-5 text-yellow-600" /></div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-blue-500 bg-blue-50 p-6 shadow-sm dark:bg-blue-950">
                        <div className="flex items-center justify-between">
                            <div><p className="text-sm font-medium text-blue-700">Preparing</p><p className="text-3xl font-bold text-blue-700">{statusCounts.preparing}</p></div>
                            <div className="rounded-full bg-blue-500/10 p-3"><Package className="h-5 w-5 text-blue-600" /></div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-green-500 bg-green-50 p-6 shadow-sm dark:bg-green-950">
                        <div className="flex items-center justify-between">
                            <div><p className="text-sm font-medium text-green-700">Ready for Pickup</p><p className="text-3xl font-bold text-green-700">{statusCounts.ready}</p></div>
                            <div className="rounded-full bg-green-500/10 p-3"><Check className="h-5 w-5 text-green-600" /></div>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div><p className="text-sm font-medium text-muted-foreground">Served Today</p><p className="text-3xl font-bold">{statusCounts.served}</p></div>
                            <div className="rounded-full bg-primary/10 p-3"><Check className="h-5 w-5 text-primary" /></div>
                        </div>
                    </div>
                </div>

                {/* QR Code Scanner */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold"><QrCode className="h-5 w-5" /> Scan Reservation QR</h2>
                    <form onSubmit={handleRedeemQR} className="flex gap-3">
                        <input value={qrCode} onChange={(e) => setQrCode(e.target.value)} placeholder="Enter or scan QR code..."
                            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm" />
                        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Redeem</button>
                    </form>
                    {qrError && <p className="mt-2 text-sm text-red-600">{qrError}</p>}
                </div>

                {/* Order Columns */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* New Orders */}
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">New Orders</h2>
                        {orders.length === 0 ? <p className="text-muted-foreground">No new orders</p> : (
                            <div className="space-y-3">
                                {orders.filter(o => o.status === 'pending').map((order) => (
                                    <div key={order.id} className="rounded-md border p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <p className="font-medium">{order.order_number}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {order.items?.map((item) => `${item.quantity}x ${item.menuItem?.name}`).join(', ')}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{formatTime(order.created_at)} — {order.user?.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">₱{formatPrice(order.total)}</p>
                                                <span className={`text-xs px-1.5 py-0.5 rounded ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {order.payment_status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => updateStatus(order.id, 'preparing')}
                                                className="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">Start Preparing</button>
                                            {order.payment_status === 'pending' && (
                                                <button onClick={() => setShowPayment(order)}
                                                    className="rounded-md border border-green-500 px-3 py-1.5 text-sm text-green-700 hover:bg-green-50 dark:hover:bg-green-950">
                                                    <DollarSign className="inline h-4 w-4 mr-1" />Confirm Pay
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Preparing */}
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">Preparing</h2>
                        {preparingOrders.length === 0 ? <p className="text-muted-foreground">No orders preparing</p> : (
                            <div className="space-y-3">
                                {preparingOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between rounded-md border border-blue-500 bg-blue-50 p-3 dark:bg-blue-950">
                                        <div>
                                            <p className="font-medium">{order.order_number}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {order.items?.map((item) => `${item.quantity}x ${item.menuItem?.name}`).join(', ')}
                                            </p>
                                        </div>
                                        <button onClick={() => updateStatus(order.id, 'ready')}
                                            className="rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700">Ready</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Ready for Pickup */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold">Ready for Pickup</h2>
                    {readyOrders.length === 0 ? <p className="text-muted-foreground">No orders ready</p> : (
                        <div className="space-y-3">
                            {readyOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between rounded-md border border-green-500 bg-green-50 p-3 dark:bg-green-950">
                                    <div>
                                        <p className="font-medium">{order.order_number}</p>
                                        <p className="text-sm text-muted-foreground">Customer: {order.user?.name}</p>
                                    </div>
                                    <button onClick={() => updateStatus(order.id, 'served')}
                                        className="rounded-md bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700">Served</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Low Stock Alerts */}
                {lowStockInventory.length > 0 && (
                    <div className="rounded-lg border border-red-500 bg-red-50 p-6 shadow-sm dark:bg-red-950">
                        <h2 className="mb-4 text-xl font-semibold text-red-700">Low Stock Alerts</h2>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {lowStockInventory.map((item) => (
                                <div key={item.id} className="flex items-center justify-between rounded-md border border-red-300 bg-white p-2 dark:border-red-800 dark:bg-red-900">
                                    <span>{item.name}</span>
                                    <span className="text-sm font-medium text-red-700">{item.current_quantity} / {item.minimum_quantity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Confirmation Modal */}
            {showPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPayment(null)}>
                    <div className="w-full max-w-sm rounded-lg bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-2 text-xl font-semibold">Confirm Payment</h2>
                        <p className="mb-4 text-sm text-muted-foreground">{showPayment.order_number} — ₱{formatPrice(showPayment.total)} via {showPayment.payment_method}</p>
                        <form onSubmit={handleConfirmPayment} className="space-y-3">
                            {showPayment.payment_method === 'gcash' && (
                                <div><label className="mb-1 block text-sm font-medium">GCash Reference #</label>
                                    <input value={gcashRef} onChange={(e) => setGcashRef(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="e.g. 1234567890" /></div>
                            )}
                            {showPayment.payment_method === 'cash' && (
                                <div><label className="mb-1 block text-sm font-medium">Cash Received (₱)</label>
                                    <input type="number" step="0.01" min={showPayment.total} value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                                    {cashReceived && parseFloat(cashReceived) >= showPayment.total && (
                                        <p className="mt-1 text-sm text-green-600">Change: ₱{formatPrice(parseFloat(cashReceived) - showPayment.total)}</p>
                                    )}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setShowPayment(null)} className="flex-1 rounded-md border py-2 text-sm hover:bg-accent">Cancel</button>
                                <button type="submit" className="flex-1 rounded-md bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700">Confirm Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}