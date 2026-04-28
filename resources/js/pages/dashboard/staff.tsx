import { Head, router, usePage } from '@inertiajs/react';
import { Package, Check, Clock, AlertTriangle, QrCode, DollarSign, ChefHat, Utensils, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

import AppLayout from '@/layouts/app-layout';
import { LiveClock } from '@/components/live-clock';
import { type BreadcrumbItem } from '@/types';

interface OrderItemMenuItem { id: number; name: string }
interface OrderItem { id: number; quantity: number; unit_price: number; subtotal: number; menu_item: OrderItemMenuItem }
interface OrderUser { id: number; name: string }
interface PaymentInfo { id: number; status: string; payment_method: string }
interface Order {
    id: number; order_number: string; total: number; status: string;
    payment_method: string | null; payment_status: string; created_at: string;
    served_at: string | null; user: OrderUser; items: OrderItem[];
    payment: PaymentInfo | null;
}
interface InventoryItem { id: number; name: string; current_quantity: number; minimum_quantity: number }
interface StatusCounts { pending: number; preparing: number; ready: number; served: number; cancelled: number }
interface StaffDashboardProps {
    pendingOrders: Order[]; preparingOrders: Order[]; readyOrders: Order[];
    servedToday: Order[]; lowStockInventory: InventoryItem[];
    statusCounts: StatusCounts; todayRevenue: number;
}

const formatPrice = (p: number | string) => Number(p).toFixed(2);
const formatTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
const formatTimeFull = (d: string) => new Date(d).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/staff/dashboard' }];

export default function StaffDashboard() {
    const { pendingOrders, preparingOrders, readyOrders, servedToday, lowStockInventory, statusCounts, todayRevenue } = usePage<StaffDashboardProps>().props;
    const [qrCode, setQrCode] = useState('');
    const [qrError, setQrError] = useState('');
    const [qrSuccess, setQrSuccess] = useState('');
    const [showPayment, setShowPayment] = useState<Order | null>(null);
    const [gcashRef, setGcashRef] = useState('');
    const [cashReceived, setCashReceived] = useState('');
    const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');

    // Auto-refresh dashboard every 10 seconds for near real-time updates
    useEffect(() => {
        const id = setInterval(() => {
            router.reload({ only: ['pendingOrders', 'preparingOrders', 'readyOrders', 'servedToday', 'statusCounts', 'lowStockInventory', 'todayRevenue'] });
        }, 10000);
        return () => clearInterval(id);
    }, []);

    const updateStatus = (orderId: number, newStatus: string) => {
        router.patch(`/staff/orders/${orderId}/status`, { status: newStatus }, { preserveScroll: true });
    };

    const handleRedeemQR = (e: React.FormEvent) => {
        e.preventDefault();
        setQrError('');
        setQrSuccess('');
        router.post('/staff/reservations/redeem', { qr_code: qrCode }, {
            preserveScroll: true,
            onError: (errs) => setQrError((errs as any).qr_code || 'Invalid QR code'),
            onSuccess: () => { setQrCode(''); setQrSuccess('Reservation redeemed successfully!'); setTimeout(() => setQrSuccess(''), 3000); },
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

    const paymentBadge = (order: Order) => {
        if (order.payment_status === 'paid') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        if (order.payment_method === 'salary_deduction') return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    };

    const paymentLabel = (order: Order) => {
        if (order.payment_status === 'paid') return 'Paid';
        if (order.payment_method === 'salary_deduction') return 'Salary';
        return order.payment_method === 'gcash' ? 'GCash pending' : 'Cash pending';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Dashboard - Kitchen" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Kitchen Dashboard</h1>
                        <p className="text-muted-foreground">Manage orders, payments and preparation</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setActiveTab('queue')}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'queue' ? 'bg-primary text-primary-foreground' : 'border bg-card hover:bg-accent'}`}>
                            <ChefHat className="mr-2 inline h-4 w-4" /> Order Queue
                        </button>
                        <button onClick={() => setActiveTab('history')}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-primary text-primary-foreground' : 'border bg-card hover:bg-accent'}`}>
                            <Utensils className="mr-2 inline h-4 w-4" /> Today's History
                        </button>
                    </div>
                </div>

                <LiveClock />

                {/* Status Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
                    <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-4 shadow-sm dark:bg-yellow-950">
                        <div className="flex items-center justify-between">
                            <div><p className="text-xs font-medium text-yellow-700 dark:text-yellow-300">New Orders</p><p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{statusCounts.pending}</p></div>
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                    </div>
                    <div className="rounded-lg border border-blue-500 bg-blue-50 p-4 shadow-sm dark:bg-blue-950">
                        <div className="flex items-center justify-between">
                            <div><p className="text-xs font-medium text-blue-700 dark:text-blue-300">Preparing</p><p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{statusCounts.preparing}</p></div>
                            <Package className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="rounded-lg border border-green-500 bg-green-50 p-4 shadow-sm dark:bg-green-950">
                        <div className="flex items-center justify-between">
                            <div><p className="text-xs font-medium text-green-700 dark:text-green-300">Ready</p><p className="text-2xl font-bold text-green-700 dark:text-green-300">{statusCounts.ready}</p></div>
                            <Check className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div><p className="text-xs font-medium text-muted-foreground">Served Today</p><p className="text-2xl font-bold">{statusCounts.served}</p></div>
                            <Utensils className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div><p className="text-xs font-medium text-muted-foreground">Today Revenue</p><p className="text-2xl font-bold">₱{formatPrice(todayRevenue)}</p></div>
                            <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                </div>

                {activeTab === 'queue' ? (
                    <>
                        {/* QR Code Scanner */}
                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold"><QrCode className="h-5 w-5" /> Scan Reservation QR</h2>
                            <form onSubmit={handleRedeemQR} className="flex gap-3">
                                <input value={qrCode} onChange={(e) => setQrCode(e.target.value)} placeholder="Enter or scan QR code..."
                                    className="flex-1 rounded-md border bg-background px-3 py-2 text-sm" />
                                <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Redeem</button>
                            </form>
                            {qrError && <p className="mt-2 text-sm text-red-600">{qrError}</p>}
                            {qrSuccess && <p className="mt-2 text-sm text-green-600">{qrSuccess}</p>}
                        </div>

                        {/* Order Pipeline */}
                        <div className="grid gap-4 lg:grid-cols-3">
                            {/* Pending */}
                            <div className="rounded-lg border bg-card shadow-sm">
                                <div className="border-b bg-yellow-50 px-4 py-3 dark:bg-yellow-950">
                                    <h2 className="flex items-center gap-2 font-semibold text-yellow-700 dark:text-yellow-300">
                                        <Clock className="h-4 w-4" /> New Orders ({pendingOrders.length})
                                    </h2>
                                </div>
                                <div className="max-h-[500px] overflow-y-auto p-3">
                                    {pendingOrders.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">No new orders</p> : (
                                        <div className="space-y-3">
                                            {pendingOrders.map((order) => (
                                                <div key={order.id} className="rounded-md border p-3">
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold">{order.order_number}</p>
                                                            <p className="text-xs text-muted-foreground">{formatTime(order.created_at)} — {order.user?.name}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium">₱{formatPrice(order.total)}</p>
                                                            <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${paymentBadge(order)}`}>
                                                                {paymentLabel(order)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="mb-2 text-sm text-muted-foreground">
                                                        {order.items?.map((item) => `${item.quantity}x ${item.menu_item?.name}`).join(', ')}
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => updateStatus(order.id, 'preparing')}
                                                            className="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                                                            Start Preparing
                                                        </button>
                                                        {order.payment_status === 'pending' && order.payment_method !== 'salary_deduction' && (
                                                            <button onClick={() => setShowPayment(order)}
                                                                className="rounded-md border border-green-500 px-3 py-1.5 text-sm text-green-700 hover:bg-green-50 dark:hover:bg-green-950">
                                                                <DollarSign className="inline h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Preparing */}
                            <div className="rounded-lg border bg-card shadow-sm">
                                <div className="border-b bg-blue-50 px-4 py-3 dark:bg-blue-950">
                                    <h2 className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300">
                                        <Package className="h-4 w-4" /> Preparing ({preparingOrders.length})
                                    </h2>
                                </div>
                                <div className="max-h-[500px] overflow-y-auto p-3">
                                    {preparingOrders.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">No orders preparing</p> : (
                                        <div className="space-y-3">
                                            {preparingOrders.map((order) => (
                                                <div key={order.id} className="rounded-md border border-blue-300 bg-blue-50/50 p-3 dark:border-blue-800 dark:bg-blue-950/50">
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold">{order.order_number}</p>
                                                            <p className="text-xs text-muted-foreground">{order.user?.name}</p>
                                                        </div>
                                                        <p className="font-medium">₱{formatPrice(order.total)}</p>
                                                    </div>
                                                    <p className="mb-2 text-sm text-muted-foreground">
                                                        {order.items?.map((item) => `${item.quantity}x ${item.menu_item?.name}`).join(', ')}
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => updateStatus(order.id, 'ready')}
                                                            className="flex-1 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">
                                                            Mark Ready
                                                        </button>
                                                        {order.payment_status === 'pending' && order.payment_method !== 'salary_deduction' && (
                                                            <button onClick={() => setShowPayment(order)}
                                                                className="rounded-md border border-green-500 px-3 py-1.5 text-sm text-green-700 hover:bg-green-50 dark:hover:bg-green-950">
                                                                <DollarSign className="inline h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Ready */}
                            <div className="rounded-lg border bg-card shadow-sm">
                                <div className="border-b bg-green-50 px-4 py-3 dark:bg-green-950">
                                    <h2 className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-300">
                                        <Check className="h-4 w-4" /> Ready for Pickup ({readyOrders.length})
                                    </h2>
                                </div>
                                <div className="max-h-[500px] overflow-y-auto p-3">
                                    {readyOrders.length === 0 ? <p className="py-4 text-center text-sm text-muted-foreground">No orders ready</p> : (
                                        <div className="space-y-3">
                                            {readyOrders.map((order) => (
                                                <div key={order.id} className="rounded-md border border-green-300 bg-green-50/50 p-3 dark:border-green-800 dark:bg-green-950/50">
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <div>
                                                            <p className="font-semibold">{order.order_number}</p>
                                                            <p className="text-xs text-muted-foreground">{order.user?.name}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium">₱{formatPrice(order.total)}</p>
                                                            <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${paymentBadge(order)}`}>
                                                                {paymentLabel(order)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => updateStatus(order.id, 'served')}
                                                        className="w-full rounded-md bg-gray-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500">
                                                        Mark Served
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Low Stock Alerts */}
                        {lowStockInventory.length > 0 && (
                            <div className="rounded-lg border border-red-500 bg-red-50 p-6 shadow-sm dark:bg-red-950">
                                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-red-700">
                                    <AlertTriangle className="h-5 w-5" /> Low Stock Alerts
                                </h2>
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                    {lowStockInventory.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between rounded-md border border-red-300 bg-white p-2 dark:border-red-800 dark:bg-red-900">
                                            <span className="text-sm">{item.name}</span>
                                            <span className="text-sm font-medium text-red-700">{item.current_quantity} / {item.minimum_quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* History Tab */
                    <div className="rounded-lg border bg-card shadow-sm">
                        <div className="border-b px-4 py-3">
                            <h2 className="font-semibold">Today's Completed Orders ({servedToday.length})</h2>
                        </div>
                        {servedToday.length === 0 ? (
                            <p className="p-8 text-center text-sm text-muted-foreground">No orders served today yet</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Order #</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Items</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Total</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Payment</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Served At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {servedToday.map((order) => (
                                            <tr key={order.id} className="border-b last:border-0">
                                                <td className="px-4 py-3 font-medium">{order.order_number}</td>
                                                <td className="px-4 py-3">{order.user?.name}</td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {order.items?.map((i) => `${i.quantity}x ${i.menu_item?.name}`).join(', ')}
                                                </td>
                                                <td className="px-4 py-3 font-medium">₱{formatPrice(order.total)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${paymentBadge(order)}`}>
                                                        {paymentLabel(order)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {order.served_at ? formatTimeFull(order.served_at) : formatTimeFull(order.created_at)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
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