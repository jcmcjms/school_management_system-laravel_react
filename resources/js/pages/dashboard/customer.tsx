import { Head, Link, usePage } from '@inertiajs/react';
import { ShoppingCart, Wallet, Clock, CalendarClock, ChefHat, CheckCircle } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { LiveClock } from '@/components/live-clock';
import { type BreadcrumbItem } from '@/types';

interface Stats {
    monthlyLimit: number;
    monthlyUsed: number;
    monthlyRemaining: number;
    totalOrders: number;
    thisMonthOrders: number;
    activeReservations: number;
}

interface OrderItemMenuItem {
    id: number;
    name: string;
}

interface OrderItem {
    id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    menu_item: OrderItemMenuItem;
}

interface Order {
    id: number;
    order_number: string;
    total: number;
    status: string;
    payment_method: string | null;
    payment_status: string;
    created_at: string;
    items: OrderItem[];
}

interface CustomerDashboardProps {
    stats: Stats;
    recentOrders: Order[];
    flash?: { success?: string };
}

const formatPrice = (price: number | string): string => Number(price).toFixed(2);
const formatDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        preparing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        ready: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        served: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return styles[status] || 'bg-gray-100';
};

const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
        paid: 'text-green-600 dark:text-green-400',
        pending: 'text-yellow-600 dark:text-yellow-400',
        failed: 'text-red-600 dark:text-red-400',
    };
    return styles[status] || '';
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/customer/dashboard' }];

export default function CustomerDashboard() {
    const { stats, recentOrders, flash } = usePage<CustomerDashboardProps>().props;
    const usagePercentage = stats.monthlyLimit > 0 ? Math.min((stats.monthlyUsed / stats.monthlyLimit) * 100, 100) : 0;
    const isFaculty = stats.monthlyLimit > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Flash message */}
                {(flash as any)?.success && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                        <CheckCircle className="h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium">{(flash as any).success}</p>
                    </div>
                )}

                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
                    <p className="text-muted-foreground">View your orders and meal reservations</p>
                </div>

                <LiveClock />

                {/* Stats Cards */}
                <div className={`grid gap-4 ${isFaculty ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                                <p className="text-3xl font-bold">{stats.totalOrders}</p>
                                <p className="text-xs text-muted-foreground">All time</p>
                            </div>
                            <div className="rounded-full bg-primary/10 p-3">
                                <ShoppingCart className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                                <p className="text-3xl font-bold">{stats.thisMonthOrders}</p>
                                <p className="text-xs text-muted-foreground">Orders</p>
                            </div>
                            <div className="rounded-full bg-primary/10 p-3">
                                <Clock className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Reservations</p>
                                <p className="text-3xl font-bold">{stats.activeReservations}</p>
                                <p className="text-xs text-muted-foreground">Active</p>
                            </div>
                            <div className="rounded-full bg-primary/10 p-3">
                                <CalendarClock className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </div>

                    {isFaculty && (
                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Salary Balance</p>
                                    <p className="text-3xl font-bold">₱{formatPrice(stats.monthlyRemaining)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        ₱{formatPrice(stats.monthlyUsed)} / ₱{formatPrice(stats.monthlyLimit)}
                                    </p>
                                </div>
                                <div className="rounded-full bg-primary/10 p-3">
                                    <Wallet className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                            {/* Usage bar */}
                            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className={`h-full rounded-full transition-all ${usagePercentage > 80 ? 'bg-red-500' : usagePercentage > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                    style={{ width: `${usagePercentage}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid gap-3 sm:grid-cols-3">
                    <Link
                        href="/menu"
                        className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary"
                    >
                        <div className="rounded-full bg-primary/10 p-2">
                            <ChefHat className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">Browse Menu</p>
                            <p className="text-xs text-muted-foreground">View and order meals</p>
                        </div>
                    </Link>
                    <Link
                        href="/orders"
                        className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary"
                    >
                        <div className="rounded-full bg-primary/10 p-2">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">My Orders</p>
                            <p className="text-xs text-muted-foreground">View order history</p>
                        </div>
                    </Link>
                    <Link
                        href="/reservations"
                        className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary"
                    >
                        <div className="rounded-full bg-primary/10 p-2">
                            <CalendarClock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">Reservations</p>
                            <p className="text-xs text-muted-foreground">Track QR pickups</p>
                        </div>
                    </Link>
                </div>

                {/* Recent Orders */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Recent Orders</h2>
                        <Link href="/orders" className="text-sm text-primary hover:underline">View all →</Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <div className="py-8 text-center">
                            <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground" />
                            <p className="mt-3 text-muted-foreground">You haven't placed any orders yet</p>
                            <Link
                                href="/menu"
                                className="mt-3 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                Browse Menu
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentOrders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={`/orders/${order.id}`}
                                    className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent/50"
                                >
                                    <div>
                                        <p className="font-medium">{order.order_number}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.items?.map((item) => `${item.quantity}x ${item.menu_item?.name}`).join(', ')}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">₱{formatPrice(order.total)}</p>
                                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <p className={`mt-0.5 text-xs font-medium capitalize ${getPaymentBadge(order.payment_status)}`}>
                                            {order.payment_status}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}