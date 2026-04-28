import { Head, usePage } from '@inertiajs/react';
import { CreditCard, DollarSign, ShoppingCart, Wallet } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { LiveClock } from '@/components/live-clock';
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

interface MonthlyData {
    month: string;
    total: number;
    orders: number;
}

interface FacultyDashboardProps {
    stats: Stats;
    recentOrders: Order[];
    lastThreeMonths: MonthlyData[];
}

const formatPrice = (price: number | string): string => {
    return Number(price).toFixed(2);
};

const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/faculty/dashboard' },
];

export default function FacultyDashboard() {
    const { stats, recentOrders, lastThreeMonths } = usePage<FacultyDashboardProps>().props;

    const usagePercentage = stats.monthlyLimit > 0 ? (stats.monthlyUsed / stats.monthlyLimit) * 100 : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Faculty Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
                    <p className="text-muted-foreground">Manage your meal orders and salary deductions</p>
                </div>

                <LiveClock />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Monthly Limit</p>
                                <p className="text-3xl font-bold">₱{formatPrice(stats.monthlyLimit)}</p>
                                <p className="text-xs text-muted-foreground">January {new Date().getFullYear()}</p>
                            </div>
                            <div className="rounded-full bg-primary/10 p-3">
                                <Wallet className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Used This Month</p>
                                <p className="text-3xl font-bold">₱{formatPrice(stats.monthlyUsed)}</p>
                            </div>
                            <div className="rounded-full bg-primary/10 p-3">
                                <CreditCard className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Remaining</p>
                                <p className="text-3xl font-bold">₱{formatPrice(stats.monthlyRemaining)}</p>
                            </div>
                            <div className="rounded-full bg-primary/10 p-3">
                                <DollarSign className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Orders</p>
                                <p className="text-3xl font-bold">{stats.thisMonthOrders}</p>
                                <p className="text-xs text-muted-foreground">This month</p>
                            </div>
                            <div className="rounded-full bg-primary/10 p-3">
                                <ShoppingCart className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">Salary Deduction Usage</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">This Month</span>
                                    <span className="font-medium">₱{formatPrice(stats.monthlyUsed)} / ₱{formatPrice(stats.monthlyLimit)}</span>
                                </div>
                                <div className="h-4 w-full rounded-full bg-secondary">
                                    <div className="h-4 rounded-full bg-primary" style={{ width: `${Math.min(usagePercentage, 100)}%` }} />
                                </div>
                                <p className="text-xs text-muted-foreground">{usagePercentage.toFixed(1)}% used</p>
                            </div>

                            {lastThreeMonths.map((monthData, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{monthData.month}</span>
                                        <span className="font-medium">₱{formatPrice(monthData.total)}</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-secondary">
                                        <div
                                            className="h-2 rounded-full bg-muted-foreground/30"
                                            style={{ width: `${stats.monthlyLimit > 0 ? (monthData.total / stats.monthlyLimit) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">Recent Orders</h2>
                        {recentOrders.length === 0 ? (
                            <p className="text-muted-foreground">No orders yet</p>
                        ) : (
                            <div className="space-y-3">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between border-b pb-2">
                                        <div>
                                            <p className="font-medium">{order.order_number}</p>
                                            <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">₱{formatPrice(order.total)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {order.payment_method === 'salary_deduction' ? 'Salary Deduct' : order.payment_method || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
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