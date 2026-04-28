import { Head, Link, usePage } from '@inertiajs/react';
import { CreditCard, DollarSign, ShoppingCart, Wallet, Receipt, TrendingDown } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { LiveClock } from '@/components/live-clock';
import { type BreadcrumbItem } from '@/types';

interface Stats {
    monthlyLimit: number;
    monthlyUsed: number;
    monthlyRemaining: number;
    totalOrders: number;
    thisMonthOrders: number;
    currentMonth: string;
}

interface OrderItemMenuItem { id: number; name: string }
interface OrderItem { id: number; quantity: number; unit_price: number; subtotal: number; menuItem: OrderItemMenuItem }

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

interface DeductionRecord {
    id: number;
    amount: number;
    running_total: number;
    order_number: string | null;
    order_status: string | null;
    created_at: string;
    date: string;
    time: string;
}

interface FacultyDashboardProps {
    stats: Stats;
    recentOrders: Order[];
    lastThreeMonths: MonthlyData[];
    deductionHistory: DeductionRecord[];
}

const formatPrice = (price: number | string): string => Number(price).toFixed(2);

const formatDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    preparing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    ready: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    served: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/faculty/dashboard' },
];

export default function FacultyDashboard() {
    const { stats, recentOrders, lastThreeMonths, deductionHistory } = usePage<FacultyDashboardProps>().props;

    const usagePercentage = stats.monthlyLimit > 0 ? (stats.monthlyUsed / stats.monthlyLimit) * 100 : 0;
    const isNearLimit = usagePercentage >= 80;
    const isOverLimit = usagePercentage >= 100;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Faculty Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
                    <p className="text-muted-foreground">Manage your meal orders and salary deductions</p>
                </div>

                <LiveClock />

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Monthly Limit</p>
                                <p className="text-3xl font-bold">₱{formatPrice(stats.monthlyLimit)}</p>
                                <p className="text-xs text-muted-foreground">{stats.currentMonth}</p>
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
                                <p className={`text-3xl font-bold ${isOverLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : ''}`}>
                                    ₱{formatPrice(stats.monthlyUsed)}
                                </p>
                            </div>
                            <div className={`rounded-full p-3 ${isOverLimit ? 'bg-red-100 dark:bg-red-900/40' : 'bg-primary/10'}`}>
                                <CreditCard className={`h-5 w-5 ${isOverLimit ? 'text-red-600' : 'text-primary'}`} />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Remaining</p>
                                <p className={`text-3xl font-bold ${stats.monthlyRemaining <= 0 ? 'text-red-600' : ''}`}>
                                    ₱{formatPrice(stats.monthlyRemaining)}
                                </p>
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

                {/* Usage Bar + History */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Salary Deduction Usage */}
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                            <TrendingDown className="h-5 w-5 text-primary" />
                            Salary Deduction Usage
                        </h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{stats.currentMonth}</span>
                                    <span className="font-medium">₱{formatPrice(stats.monthlyUsed)} / ₱{formatPrice(stats.monthlyLimit)}</span>
                                </div>
                                <div className="h-4 w-full rounded-full bg-secondary">
                                    <div className={`h-4 rounded-full transition-all ${
                                        isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-primary'
                                    }`} style={{ width: `${Math.min(usagePercentage, 100)}%` }} />
                                </div>
                                <p className={`text-xs ${isOverLimit ? 'text-red-600 font-medium' : isNearLimit ? 'text-amber-600' : 'text-muted-foreground'}`}>
                                    {usagePercentage.toFixed(1)}% used
                                    {isOverLimit && ' — Limit reached!'}
                                    {isNearLimit && !isOverLimit && ' — Approaching limit'}
                                </p>
                            </div>

                            <hr className="border-border" />
                            <p className="text-sm font-medium text-muted-foreground">Previous Months</p>

                            {lastThreeMonths.map((monthData, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{monthData.month}</span>
                                        <span className="font-medium">₱{formatPrice(monthData.total)} ({monthData.orders} orders)</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-secondary">
                                        <div
                                            className="h-2 rounded-full bg-muted-foreground/30"
                                            style={{ width: `${stats.monthlyLimit > 0 ? Math.min((monthData.total / stats.monthlyLimit) * 100, 100) : 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Deduction History */}
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                            <Receipt className="h-5 w-5 text-primary" />
                            Deduction History ({stats.currentMonth})
                        </h2>
                        {deductionHistory.length === 0 ? (
                            <div className="py-8 text-center">
                                <Receipt className="mx-auto h-10 w-10 text-muted-foreground/30" />
                                <p className="mt-2 text-sm text-muted-foreground">No salary deductions this month</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {deductionHistory.map((d) => (
                                    <div key={d.id} className="flex items-center justify-between rounded-md border p-3">
                                        <div>
                                            <p className="text-sm font-medium">{d.order_number || 'N/A'}</p>
                                            <p className="text-xs text-muted-foreground">{d.date} at {d.time}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-red-600 dark:text-red-400">-₱{formatPrice(d.amount)}</p>
                                            <p className="text-xs text-muted-foreground">Balance: ₱{formatPrice(stats.monthlyLimit - d.running_total)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Recent Orders</h2>
                        <Link href="/orders" className="text-sm font-medium text-primary hover:underline">View all</Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <p className="text-muted-foreground">No orders yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="pb-2 font-medium text-muted-foreground">Order</th>
                                        <th className="pb-2 font-medium text-muted-foreground">Items</th>
                                        <th className="pb-2 font-medium text-muted-foreground">Total</th>
                                        <th className="pb-2 font-medium text-muted-foreground">Payment</th>
                                        <th className="pb-2 font-medium text-muted-foreground">Status</th>
                                        <th className="pb-2 font-medium text-muted-foreground">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b last:border-0">
                                            <td className="py-3">
                                                <Link href={`/orders/${order.id}`} className="font-medium text-primary hover:underline">
                                                    {order.order_number}
                                                </Link>
                                            </td>
                                            <td className="py-3 text-muted-foreground">
                                                {order.items.map(i => i.menuItem.name).join(', ')}
                                            </td>
                                            <td className="py-3 font-medium">₱{formatPrice(order.total)}</td>
                                            <td className="py-3">
                                                <span className="text-xs capitalize">
                                                    {order.payment_method === 'salary_deduction' ? 'Salary' : order.payment_method || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[order.status] || 'bg-gray-100'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-muted-foreground">{formatDate(order.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                    <Link href="/menu"
                        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90">
                        <ShoppingCart className="mr-2 h-5 w-5" /> Browse Menu
                    </Link>
                    <Link href="/orders"
                        className="inline-flex items-center justify-center rounded-md border bg-card px-6 py-3 font-medium hover:bg-accent">
                        <Receipt className="mr-2 h-5 w-5" /> All Orders
                    </Link>
                    <Link href="/reservations"
                        className="inline-flex items-center justify-center rounded-md border bg-card px-6 py-3 font-medium hover:bg-accent">
                        <CreditCard className="mr-2 h-5 w-5" /> Reservations
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}