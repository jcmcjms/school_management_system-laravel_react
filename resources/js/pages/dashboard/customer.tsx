import { Head, usePage } from '@inertiajs/react';
import { ShoppingCart, Wallet, Clock } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Stats {
    monthlyLimit: number;
    monthlyUsed: number;
    monthlyRemaining: number;
    totalOrders: number;
    thisMonthOrders: number;
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
    menuItem: OrderItemMenuItem;
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
}

const formatPrice = (price: number | string): string => {
    return Number(price).toFixed(2);
};

const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer/dashboard' },
];

export default function CustomerDashboard() {
    const { stats, recentOrders } = usePage<CustomerDashboardProps>().props;

    const usagePercentage = stats.monthlyLimit > 0 ? (stats.monthlyUsed / stats.monthlyLimit) * 100 : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
                    <p className="text-muted-foreground">View your orders and meal reservations</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">My Orders</p>
                                <p className="text-3xl font-bold">{stats.totalOrders}</p>
                                <p className="text-xs text-muted-foreground">Total all time</p>
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
                                <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
                                <p className="text-3xl font-bold">₱{formatPrice(stats.monthlyRemaining)}</p>
                                <p className="text-xs text-muted-foreground">For this month</p>
                            </div>
                            <div className="rounded-full bg-primary/10 p-3">
                                <Wallet className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold">Recent Orders</h2>
                    {recentOrders.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
                            <a
                                href="/menu"
                                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                Browse Menu
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between rounded-md border p-3">
                                    <div>
                                        <p className="font-medium">{order.order_number}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.items?.map((item) => `${item.quantity}x ${item.menuItem?.name}`).join(', ')}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">₱{formatPrice(order.total)}</p>
                                        <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <a
                        href="/menu"
                        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Browse Menu
                    </a>
                </div>
            </div>
        </AppLayout>
    );
}