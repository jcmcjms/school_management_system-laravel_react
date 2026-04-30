import { Head, Link, usePage } from '@inertiajs/react';
import { CreditCard, DollarSign, Receipt, ShoppingCart, TrendingDown, Wallet } from 'lucide-react';

import { LiveClock } from '@/components/live-clock';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Stats {
    monthlyLimit: number;
    monthlyUsed: number;
    monthlyRemaining: number;
    totalOrders: number;
    thisMonthOrders: number;
    currentMonth: string;
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

const formatDate = (dateStr: string): string => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    preparing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    ready: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    served: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/faculty/dashboard' }];

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
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Monthly Limit</p>
                                <p className="text-3xl font-bold">₱{formatPrice(stats.monthlyLimit)}</p>
                                <p className="text-muted-foreground text-xs">{stats.currentMonth}</p>
                            </div>
                            <div className="bg-primary/10 rounded-full p-3">
                                <Wallet className="text-primary h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Used This Month</p>
                                <p className={`text-3xl font-bold ${isOverLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : ''}`}>
                                    ₱{formatPrice(stats.monthlyUsed)}
                                </p>
                            </div>
                            <div className={`rounded-full p-3 ${isOverLimit ? 'bg-red-100 dark:bg-red-900/40' : 'bg-primary/10'}`}>
                                <CreditCard className={`h-5 w-5 ${isOverLimit ? 'text-red-600' : 'text-primary'}`} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Remaining</p>
                                <p className={`text-3xl font-bold ${stats.monthlyRemaining <= 0 ? 'text-red-600' : ''}`}>
                                    ₱{formatPrice(stats.monthlyRemaining)}
                                </p>
                            </div>
                            <div className="bg-primary/10 rounded-full p-3">
                                <DollarSign className="text-primary h-5 w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm font-medium">Orders</p>
                                <p className="text-3xl font-bold">{stats.thisMonthOrders}</p>
                                <p className="text-muted-foreground text-xs">This month</p>
                            </div>
                            <div className="bg-primary/10 rounded-full p-3">
                                <ShoppingCart className="text-primary h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Usage Bar + History */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Salary Deduction Usage */}
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                            <TrendingDown className="text-primary h-5 w-5" />
                            Salary Deduction Usage
                        </h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{stats.currentMonth}</span>
                                    <span className="font-medium">
                                        ₱{formatPrice(stats.monthlyUsed)} / ₱{formatPrice(stats.monthlyLimit)}
                                    </span>
                                </div>
                                <div className="bg-secondary h-4 w-full rounded-full">
                                    <div
                                        className={`h-4 rounded-full transition-all ${
                                            isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-primary'
                                        }`}
                                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                    />
                                </div>
                                <p
                                    className={`text-xs ${isOverLimit ? 'font-medium text-red-600' : isNearLimit ? 'text-amber-600' : 'text-muted-foreground'}`}
                                >
                                    {usagePercentage.toFixed(1)}% used
                                    {isOverLimit && ' — Limit reached!'}
                                    {isNearLimit && !isOverLimit && ' — Approaching limit'}
                                </p>
                            </div>

                            <hr className="border-border" />
                            <p className="text-muted-foreground text-sm font-medium">Previous Months</p>

                            {lastThreeMonths.map((monthData, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{monthData.month}</span>
                                        <span className="font-medium">
                                            ₱{formatPrice(monthData.total)} ({monthData.orders} orders)
                                        </span>
                                    </div>
                                    <div className="bg-secondary h-2 w-full rounded-full">
                                        <div
                                            className="bg-muted-foreground/30 h-2 rounded-full"
                                            style={{
                                                width: `${stats.monthlyLimit > 0 ? Math.min((monthData.total / stats.monthlyLimit) * 100, 100) : 0}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Deduction History */}
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                            <Receipt className="text-primary h-5 w-5" />
                            Deduction History ({stats.currentMonth})
                        </h2>
                        {deductionHistory.length === 0 ? (
                            <div className="py-8 text-center">
                                <Receipt className="text-muted-foreground/30 mx-auto h-10 w-10" />
                                <p className="text-muted-foreground mt-2 text-sm">No salary deductions this month</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {deductionHistory.map((d) => (
                                    <div key={d.id} className="flex items-center justify-between rounded-md border p-3">
                                        <div>
                                            <p className="text-sm font-medium">{d.order_number || 'N/A'}</p>
                                            <p className="text-muted-foreground text-xs">
                                                {d.date} at {d.time}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-red-600 dark:text-red-400">-₱{formatPrice(d.amount)}</p>
                                            <p className="text-muted-foreground text-xs">
                                                Balance: ₱{formatPrice(stats.monthlyLimit - d.running_total)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-card rounded-lg border p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Recent Orders</h2>
                        <Link href="/orders" className="text-primary text-sm font-medium hover:underline">
                            View all
                        </Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <p className="text-muted-foreground">No orders yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="text-muted-foreground pb-2 font-medium">Order</th>
                                        <th className="text-muted-foreground pb-2 font-medium">Items</th>
                                        <th className="text-muted-foreground pb-2 font-medium">Total</th>
                                        <th className="text-muted-foreground pb-2 font-medium">Payment</th>
                                        <th className="text-muted-foreground pb-2 font-medium">Status</th>
                                        <th className="text-muted-foreground pb-2 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b last:border-0">
                                            <td className="py-3">
                                                <Link href={`/orders/${order.id}`} className="text-primary font-medium hover:underline">
                                                    {order.order_number}
                                                </Link>
                                            </td>
                                            <td className="text-muted-foreground py-3">{order.items.map((i) => i.menu_item.name).join(', ')}</td>
                                            <td className="py-3 font-medium">₱{formatPrice(order.total)}</td>
                                            <td className="py-3">
                                                <span className="text-xs capitalize">
                                                    {order.payment_method === 'salary_deduction' ? 'Salary' : order.payment_method || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <span
                                                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[order.status] || 'bg-gray-100'}`}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="text-muted-foreground py-3">{formatDate(order.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/menu"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-6 py-3 font-medium"
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" /> Browse Menu
                    </Link>
                    <Link
                        href="/orders"
                        className="bg-card hover:bg-accent inline-flex items-center justify-center rounded-md border px-6 py-3 font-medium"
                    >
                        <Receipt className="mr-2 h-5 w-5" /> All Orders
                    </Link>
                    <Link
                        href="/reservations"
                        className="bg-card hover:bg-accent inline-flex items-center justify-center rounded-md border px-6 py-3 font-medium"
                    >
                        <CreditCard className="mr-2 h-5 w-5" /> Reservations
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
