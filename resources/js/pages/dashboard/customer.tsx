import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarClock, CheckCircle, ChefHat, Clock, ShoppingCart, Wallet } from 'lucide-react';

import { LiveClock } from '@/components/live-clock';
import AppLayout from '@/layouts/app-layout';
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
const formatDate = (dateStr: string): string => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Total Orders</p>
                                <p className="text-3xl font-bold">{stats.totalOrders}</p>
                                <p className="text-muted-foreground text-xs">All time</p>
                            </div>
                            <div className="bg-primary/10 rounded-full p-3">
                                <ShoppingCart className="text-primary h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">This Month</p>
                                <p className="text-3xl font-bold">{stats.thisMonthOrders}</p>
                                <p className="text-muted-foreground text-xs">Orders</p>
                            </div>
                            <div className="bg-primary/10 rounded-full p-3">
                                <Clock className="text-primary h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Reservations</p>
                                <p className="text-3xl font-bold">{stats.activeReservations}</p>
                                <p className="text-muted-foreground text-xs">Active</p>
                            </div>
                            <div className="bg-primary/10 rounded-full p-3">
                                <CalendarClock className="text-primary h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    {isFaculty && (
                        <div className="bg-card rounded-lg border p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm font-medium">Salary Balance</p>
                                    <p className="text-3xl font-bold">₱{formatPrice(stats.monthlyRemaining)}</p>
                                    <p className="text-muted-foreground text-xs">
                                        ₱{formatPrice(stats.monthlyUsed)} / ₱{formatPrice(stats.monthlyLimit)}
                                    </p>
                                </div>
                                <div className="bg-primary/10 rounded-full p-3">
                                    <Wallet className="text-primary h-5 w-5" />
                                </div>
                            </div>
                            {/* Usage bar */}
                            <div className="bg-muted mt-3 h-2 w-full overflow-hidden rounded-full">
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
                        className="bg-card hover:border-primary flex items-center gap-3 rounded-lg border p-4 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="bg-primary/10 rounded-full p-2">
                            <ChefHat className="text-primary h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium">Browse Menu</p>
                            <p className="text-muted-foreground text-xs">View and order meals</p>
                        </div>
                    </Link>
                    <Link
                        href="/orders"
                        className="bg-card hover:border-primary flex items-center gap-3 rounded-lg border p-4 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="bg-primary/10 rounded-full p-2">
                            <ShoppingCart className="text-primary h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium">My Orders</p>
                            <p className="text-muted-foreground text-xs">View order history</p>
                        </div>
                    </Link>
                    <Link
                        href="/reservations"
                        className="bg-card hover:border-primary flex items-center gap-3 rounded-lg border p-4 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="bg-primary/10 rounded-full p-2">
                            <CalendarClock className="text-primary h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium">Reservations</p>
                            <p className="text-muted-foreground text-xs">Track QR pickups</p>
                        </div>
                    </Link>
                </div>

                {/* Recent Orders */}
                <div className="bg-card rounded-lg border p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Recent Orders</h2>
                        <Link href="/orders" className="text-primary text-sm hover:underline">
                            View all →
                        </Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <div className="py-8 text-center">
                            <ShoppingCart className="text-muted-foreground mx-auto h-10 w-10" />
                            <p className="text-muted-foreground mt-3">You haven't placed any orders yet</p>
                            <Link
                                href="/menu"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
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
                                    className="hover:bg-accent/50 flex items-center justify-between rounded-md border p-3 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium">{order.order_number}</p>
                                        <p className="text-muted-foreground text-sm">
                                            {order.items?.map((item) => `${item.quantity}x ${item.menu_item?.name}`).join(', ')}
                                        </p>
                                        <p className="text-muted-foreground text-xs">{formatDate(order.created_at)}</p>
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
