import { Head, router, usePage } from '@inertiajs/react';
import { AlertTriangle, Download, ShoppingBag, TrendingUp } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface RevenueData {
    total: number;
    gcash: number;
    cash: number;
    salary_deduction: number;
    order_count: number;
    average_order: number;
}
interface FacultyDeduction {
    id: number;
    name: string;
    employee_id: string | null;
    department: string | null;
    limit: number;
    used: number;
    remaining: number;
    percentage: number;
    near_limit: boolean;
}
interface RecentOrder {
    id: number;
    order_number: string;
    total: number;
    payment_method: string;
    created_at: string;
    user: { name: string };
}
interface TopItem {
    id: number;
    name: string;
    total_qty: number;
    total_revenue: number;
}
interface DailyRevenue {
    date: string;
    daily_total: number;
    order_count: number;
}
interface RevenueProps {
    revenue: RevenueData;
    recentOrders: RecentOrder[];
    facultyDeductions: FacultyDeduction[];
    topItems: TopItem[];
    dailyRevenue: DailyRevenue[];
    filters: { start_date: string; end_date: string };
}

const formatPrice = (p: number | string) => Number(p).toFixed(2);
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Revenue', href: '/admin/revenue' },
];

export default function AdminRevenue() {
    const { revenue, recentOrders, facultyDeductions, topItems, dailyRevenue, filters } = usePage<RevenueProps>().props;
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleFilter = () => router.get('/admin/revenue', { start_date: startDate, end_date: endDate }, { preserveState: true });

    const safeDailyRevenue = (dailyRevenue as DailyRevenue[]) || [];
    const safeTopItems = (topItems as TopItem[]) || [];
    const safeFacultyDeductions = (facultyDeductions as FacultyDeduction[]) || [];

    const maxDaily = Math.max(...safeDailyRevenue.map((d) => d.daily_total), 1);

    const gcashPct = revenue.total > 0 ? (revenue.gcash / revenue.total) * 100 : 0;
    const cashPct = revenue.total > 0 ? (revenue.cash / revenue.total) * 100 : 0;
    const deductPct = revenue.total > 0 ? (revenue.salary_deduction / revenue.total) * 100 : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Revenue Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Revenue Dashboard</h1>
                        <p className="text-muted-foreground">Track sales and faculty deductions</p>
                    </div>
                    <a
                        href={`/admin/revenue/export?start_date=${startDate}&end_date=${endDate}`}
                        className="hover:bg-accent inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium"
                    >
                        <Download className="mr-2 h-4 w-4" /> Export CSV
                    </a>
                </div>

                {/* Date Filter */}
                <div className="flex items-end gap-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-background rounded-md border px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-background rounded-md border px-3 py-2 text-sm"
                        />
                    </div>
                    <button
                        onClick={handleFilter}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
                    >
                        Apply
                    </button>
                </div>

                {/* Revenue Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <p className="text-muted-foreground text-sm font-medium">Total Revenue</p>
                        <p className="text-3xl font-bold">₱{formatPrice(revenue.total)}</p>
                        <p className="text-muted-foreground text-xs">{revenue.order_count} orders</p>
                    </div>
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <p className="text-muted-foreground text-sm font-medium">Avg Order</p>
                        <p className="text-3xl font-bold">₱{formatPrice(revenue.average_order)}</p>
                        <p className="text-muted-foreground text-xs">per order</p>
                    </div>
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <p className="text-sm font-medium text-blue-600">GCash</p>
                        <p className="text-3xl font-bold">₱{formatPrice(revenue.gcash)}</p>
                        <p className="text-muted-foreground text-xs">{gcashPct.toFixed(1)}% of total</p>
                    </div>
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <p className="text-sm font-medium text-green-600">Cash</p>
                        <p className="text-3xl font-bold">₱{formatPrice(revenue.cash)}</p>
                        <p className="text-muted-foreground text-xs">{cashPct.toFixed(1)}% of total</p>
                    </div>
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <p className="text-sm font-medium text-purple-600">Salary Deduction</p>
                        <p className="text-3xl font-bold">₱{formatPrice(revenue.salary_deduction)}</p>
                        <p className="text-muted-foreground text-xs">{deductPct.toFixed(1)}% of total</p>
                    </div>
                </div>

                {/* Payment Breakdown Bar */}
                <div className="bg-card rounded-lg border p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold">Payment Method Breakdown</h2>
                    <div className="bg-muted flex h-8 w-full overflow-hidden rounded-full">
                        {gcashPct > 0 && (
                            <div
                                className="h-full bg-blue-500 transition-all"
                                style={{ width: `${gcashPct}%` }}
                                title={`GCash: ${gcashPct.toFixed(1)}%`}
                            />
                        )}
                        {cashPct > 0 && (
                            <div
                                className="h-full bg-green-500 transition-all"
                                style={{ width: `${cashPct}%` }}
                                title={`Cash: ${cashPct.toFixed(1)}%`}
                            />
                        )}
                        {deductPct > 0 && (
                            <div
                                className="h-full bg-purple-500 transition-all"
                                style={{ width: `${deductPct}%` }}
                                title={`Salary: ${deductPct.toFixed(1)}%`}
                            />
                        )}
                    </div>
                    <div className="mt-3 flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-blue-500" />
                            <span>GCash</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                            <span>Cash</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-purple-500" />
                            <span>Salary Deduction</span>
                        </div>
                    </div>
                </div>

                {/* Daily Revenue Trend */}
                <div className="bg-card rounded-lg border p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                        <TrendingUp className="h-5 w-5" /> Daily Revenue Trend
                    </h2>
                    {safeDailyRevenue.length === 0 ? (
                        <p className="text-muted-foreground">No data for this period</p>
                    ) : (
                        <div className="flex h-40 items-end gap-1">
                            {safeDailyRevenue.map((day, i) => (
                                <div key={i} className="flex flex-1 flex-col items-center">
                                    <div
                                        className="bg-primary w-full rounded-t"
                                        style={{ height: `${(day.daily_total / maxDaily) * 100}%`, minHeight: day.daily_total > 0 ? '4px' : '0' }}
                                        title={`₱${formatPrice(day.daily_total)}`}
                                    />
                                    <p className="text-muted-foreground mt-1 w-full truncate text-center text-[10px]">
                                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Selling Items */}
                <div className="bg-card rounded-lg border p-6 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                        <ShoppingBag className="h-5 w-5" /> Top Selling Items
                    </h2>
                    {safeTopItems.length === 0 ? (
                        <p className="text-muted-foreground">No sales data for this period</p>
                    ) : (
                        <div className="space-y-2">
                            {safeTopItems.map((item, i) => (
                                <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                                        >
                                            {i + 1}
                                        </span>
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">₱{formatPrice(item.total_revenue)}</p>
                                        <p className="text-muted-foreground text-xs">{item.total_qty} sold</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Orders */}
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">Recent Paid Orders</h2>
                        {recentOrders.length === 0 ? (
                            <p className="text-muted-foreground">No orders in this period</p>
                        ) : (
                            <div className="space-y-2">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between border-b pb-2 text-sm">
                                        <div>
                                            <p className="font-medium">{order.order_number}</p>
                                            <p className="text-muted-foreground text-xs">{order.user.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">₱{formatPrice(order.total)}</p>
                                            <p className="text-muted-foreground text-xs capitalize">{order.payment_method?.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Faculty Deductions */}
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">Faculty Salary Deductions</h2>
                        {safeFacultyDeductions.length === 0 ? (
                            <p className="text-muted-foreground">No faculty users</p>
                        ) : (
                            <div className="space-y-3">
                                {safeFacultyDeductions.map((f) => (
                                    <div
                                        key={f.id}
                                        className={`rounded-md border p-3 ${f.near_limit ? 'border-red-500 bg-red-50 dark:bg-red-950/30' : ''}`}
                                    >
                                        <div className="mb-1 flex items-center justify-between">
                                            <div>
                                                <span className="font-medium">{f.name}</span>
                                                {f.near_limit && <AlertTriangle className="ml-1 inline h-4 w-4 text-red-500" />}
                                            </div>
                                            <span className="text-sm font-medium">
                                                ₱{formatPrice(f.used)} / ₱{formatPrice(f.limit)}
                                            </span>
                                        </div>
                                        <div className="bg-muted h-2 w-full rounded-full">
                                            <div
                                                className={`h-2 rounded-full ${f.percentage >= 90 ? 'bg-red-500' : f.percentage >= 70 ? 'bg-yellow-500' : 'bg-primary'}`}
                                                style={{ width: `${Math.min(f.percentage, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            {f.percentage}% used — ₱{formatPrice(f.remaining)} remaining
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
