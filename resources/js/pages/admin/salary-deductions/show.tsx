import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CreditCard, Edit2 } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Employee {
    id: number;
    name: string;
    email: string;
    role: string;
    employee_id: string;
    department: string;
    position: string;
    limit: number;
    used: number;
    remaining: number;
}

interface OrderRef {
    id: number;
    order_number: string;
    total: number;
    status: string;
    created_at: string;
}
interface Deduction {
    id: number;
    amount: number;
    payroll_month: string;
    payroll_year: number;
    created_at: string;
    order: OrderRef | null;
}

interface MonthlyBreakdown {
    label: string;
    total: number;
}

interface Props {
    employee: Employee;
    deductions: { data: Deduction[]; current_page: number; last_page: number };
    monthlyBreakdown: MonthlyBreakdown[];
    currentMonth: string;
}

const formatPrice = (p: number) => Number(p).toFixed(2);
const formatDate = (d: string) => new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
const formatTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

const roleBadge: Record<string, string> = {
    manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    staff: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    faculty: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
};

export default function SalaryDeductionShow() {
    const { employee, deductions, monthlyBreakdown, currentMonth } = usePage<Props>().props;
    const [editing, setEditing] = useState(false);
    const [newLimit, setNewLimit] = useState(String(employee.limit));

    const usagePercent = employee.limit > 0 ? Math.round((employee.used / employee.limit) * 100) : 0;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Salary Deductions', href: '/admin/salary-deductions' },
        { title: employee.name, href: `/admin/salary-deductions/${employee.id}` },
    ];

    const handleUpdateLimit = () => {
        router.patch(
            `/admin/salary-deductions/${employee.id}/limit`,
            {
                salary_deduction_limit: parseFloat(newLimit),
            },
            {
                preserveScroll: true,
                onSuccess: () => setEditing(false),
            },
        );
    };

    const maxBarValue = Math.max(...monthlyBreakdown.map((m) => m.total), employee.limit, 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Deductions - ${employee.name}`} />
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/salary-deductions" className="hover:bg-accent rounded-md p-2">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">{employee.name}</h1>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${roleBadge[employee.role] || 'bg-gray-100'}`}>
                                {employee.role}
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            {employee.employee_id} — {employee.department} — {employee.position}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-card rounded-lg border p-5 shadow-sm">
                        <p className="text-muted-foreground text-xs font-medium">Monthly Limit</p>
                        {editing ? (
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-lg">₱</span>
                                <input
                                    type="number"
                                    value={newLimit}
                                    onChange={(e) => setNewLimit(e.target.value)}
                                    className="bg-background w-32 rounded border px-2 py-1 text-lg font-bold"
                                    autoFocus
                                />
                                <button onClick={handleUpdateLimit} className="bg-primary text-primary-foreground rounded px-3 py-1 text-sm">
                                    Save
                                </button>
                                <button onClick={() => setEditing(false)} className="rounded border px-3 py-1 text-sm">
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold">₱{formatPrice(employee.limit)}</p>
                                <button
                                    onClick={() => {
                                        setEditing(true);
                                        setNewLimit(String(employee.limit));
                                    }}
                                    className="text-muted-foreground hover:bg-accent rounded p-1"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="bg-card rounded-lg border p-5 shadow-sm">
                        <p className="text-muted-foreground text-xs font-medium">Used ({currentMonth})</p>
                        <p className="text-2xl font-bold text-amber-600">₱{formatPrice(employee.used)}</p>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                                className={`h-full rounded-full transition-all ${usagePercent >= 100 ? 'bg-red-500' : usagePercent >= 80 ? 'bg-amber-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">{usagePercent}% of limit</p>
                    </div>
                    <div className="bg-card rounded-lg border p-5 shadow-sm">
                        <p className="text-muted-foreground text-xs font-medium">Remaining</p>
                        <p className={`text-2xl font-bold ${employee.remaining <= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ₱{formatPrice(employee.remaining)}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                            {deductions.data.length > 0 ? `${deductions.data.length} transactions this page` : 'No transactions'}
                        </p>
                    </div>
                </div>

                {/* Monthly Breakdown */}
                <div className="bg-card rounded-lg border p-6 shadow-sm">
                    <h2 className="mb-4 font-semibold">6-Month Breakdown</h2>
                    <div className="space-y-3">
                        {monthlyBreakdown.map((m, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-muted-foreground w-20 text-sm">{m.label}</span>
                                <div className="flex-1">
                                    <div className="h-6 w-full overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                                        <div
                                            className={`h-full rounded transition-all ${i === 0 ? 'bg-primary' : 'bg-primary/50'}`}
                                            style={{ width: `${maxBarValue > 0 ? (m.total / maxBarValue) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="w-24 text-right text-sm font-medium">₱{formatPrice(m.total)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-card rounded-lg border shadow-sm">
                    <div className="border-b px-4 py-3">
                        <h2 className="font-semibold">Transaction History</h2>
                    </div>
                    {deductions.data.length === 0 ? (
                        <div className="p-8 text-center">
                            <CreditCard className="text-muted-foreground/30 mx-auto h-10 w-10" />
                            <p className="text-muted-foreground mt-2 text-sm">No deduction transactions</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="text-muted-foreground px-4 py-3 font-medium">Date</th>
                                        <th className="text-muted-foreground px-4 py-3 font-medium">Order</th>
                                        <th className="text-muted-foreground px-4 py-3 font-medium">Amount</th>
                                        <th className="text-muted-foreground px-4 py-3 font-medium">Payroll Period</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deductions.data.map((d) => (
                                        <tr key={d.id} className="border-b last:border-0">
                                            <td className="px-4 py-3">
                                                <p className="text-sm">{formatDate(d.created_at)}</p>
                                                <p className="text-muted-foreground text-xs">{formatTime(d.created_at)}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                {d.order ? (
                                                    <Link href={`/orders/${d.order.id}`} className="text-primary font-medium hover:underline">
                                                        {d.order.order_number}
                                                    </Link>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-medium">₱{formatPrice(d.amount)}</td>
                                            <td className="text-muted-foreground px-4 py-3">
                                                {d.payroll_month}/{d.payroll_year}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {deductions.last_page > 1 && (
                        <div className="flex items-center justify-center gap-2 border-t px-4 py-3">
                            {Array.from({ length: deductions.last_page }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => router.get(`/admin/salary-deductions/${employee.id}`, { page }, { preserveState: true })}
                                    className={`rounded px-3 py-1 text-sm ${page === deductions.current_page ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
