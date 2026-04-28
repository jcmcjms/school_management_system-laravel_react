import { Head, Link, router, usePage } from '@inertiajs/react';
import { CreditCard, Users, AlertTriangle, TrendingUp, Edit2, Eye, DollarSign } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Employee {
    id: number; name: string; email: string; role: string;
    employee_id: string; department: string; position: string;
    limit: number; used: number; remaining: number;
    usage_percent: number; transaction_count: number;
}

interface Deduction {
    id: number; user_name: string; user_role: string; employee_id: string;
    order_number: string; amount: number; payroll_month: string;
    payroll_year: number; created_at: string; date: string; time: string;
}

interface Summary {
    totalEmployees: number; totalLimit: number; totalUsed: number;
    totalRemaining: number; employeesAtLimit: number;
}

interface Props {
    employees: Employee[]; recentDeductions: Deduction[];
    summary: Summary; currentMonth: string;
}

const formatPrice = (p: number) => Number(p).toFixed(2);

const roleBadge: Record<string, string> = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    staff: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    faculty: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Salary Deductions', href: '/admin/salary-deductions' },
];

export default function SalaryDeductionsIndex() {
    const { employees, recentDeductions, summary, currentMonth } = usePage<Props>().props;
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newLimit, setNewLimit] = useState('');
    const [activeTab, setActiveTab] = useState<'employees' | 'transactions'>('employees');
    const [filter, setFilter] = useState<string>('all');

    const handleUpdateLimit = (userId: number) => {
        router.patch(`/admin/salary-deductions/${userId}/limit`, {
            salary_deduction_limit: parseFloat(newLimit),
        }, {
            preserveScroll: true,
            onSuccess: () => { setEditingId(null); setNewLimit(''); },
        });
    };

    const filteredEmployees = filter === 'all'
        ? employees
        : employees.filter(e => e.role === filter);

    const usageColor = (percent: number) => {
        if (percent >= 100) return 'bg-red-500';
        if (percent >= 80) return 'bg-amber-500';
        return 'bg-green-500';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Salary Deductions" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Salary Deductions</h1>
                        <p className="text-muted-foreground">Monitor employee salary deductions — {currentMonth}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setActiveTab('employees')}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'employees' ? 'bg-primary text-primary-foreground' : 'border bg-card hover:bg-accent'}`}>
                            <Users className="mr-2 inline h-4 w-4" /> Employees
                        </button>
                        <button onClick={() => setActiveTab('transactions')}
                            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'transactions' ? 'bg-primary text-primary-foreground' : 'border bg-card hover:bg-accent'}`}>
                            <CreditCard className="mr-2 inline h-4 w-4" /> Transactions
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div><p className="text-xs font-medium text-muted-foreground">Employees</p><p className="text-2xl font-bold">{summary.totalEmployees}</p></div>
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div><p className="text-xs font-medium text-muted-foreground">Total Limit</p><p className="text-2xl font-bold">₱{formatPrice(summary.totalLimit)}</p></div>
                            <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div><p className="text-xs font-medium text-muted-foreground">Total Used</p><p className="text-2xl font-bold text-amber-600">₱{formatPrice(summary.totalUsed)}</p></div>
                            <TrendingUp className="h-5 w-5 text-amber-500" />
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div><p className="text-xs font-medium text-muted-foreground">Remaining</p><p className="text-2xl font-bold text-green-600">₱{formatPrice(summary.totalRemaining)}</p></div>
                            <DollarSign className="h-5 w-5 text-green-500" />
                        </div>
                    </div>
                    {summary.employeesAtLimit > 0 && (
                        <div className="rounded-lg border border-red-500 bg-red-50 p-4 shadow-sm dark:bg-red-950">
                            <div className="flex items-center justify-between">
                                <div><p className="text-xs font-medium text-red-700 dark:text-red-300">At Limit</p><p className="text-2xl font-bold text-red-700 dark:text-red-300">{summary.employeesAtLimit}</p></div>
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                            </div>
                        </div>
                    )}
                </div>

                {activeTab === 'employees' ? (
                    <>
                        {/* Role filter */}
                        <div className="flex gap-2">
                            {['all', 'manager', 'staff', 'faculty'].map(r => (
                                <button key={r} onClick={() => setFilter(r)}
                                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${filter === r ? 'bg-primary text-primary-foreground' : 'border bg-card hover:bg-accent'}`}>
                                    {r === 'all' ? 'All Roles' : r}
                                </button>
                            ))}
                        </div>

                        {/* Employee Table */}
                        <div className="rounded-lg border bg-card shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Employee</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Role</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Limit</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Used</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Usage</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Txns</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEmployees.length === 0 ? (
                                            <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No employees with salary deduction</td></tr>
                                        ) : filteredEmployees.map(emp => (
                                            <tr key={emp.id} className="border-b last:border-0">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium">{emp.name}</p>
                                                        <p className="text-xs text-muted-foreground">{emp.employee_id} — {emp.department}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${roleBadge[emp.role] || 'bg-gray-100'}`}>
                                                        {emp.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {editingId === emp.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <input type="number" value={newLimit} onChange={e => setNewLimit(e.target.value)}
                                                                className="w-24 rounded border bg-background px-2 py-1 text-sm" placeholder="0.00" autoFocus />
                                                            <button onClick={() => handleUpdateLimit(emp.id)}
                                                                className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground">Save</button>
                                                            <button onClick={() => setEditingId(null)}
                                                                className="rounded border px-2 py-1 text-xs">×</button>
                                                        </div>
                                                    ) : (
                                                        <span className="font-medium">₱{formatPrice(emp.limit)}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 font-medium">₱{formatPrice(emp.used)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                                            <div className={`h-full rounded-full transition-all ${usageColor(emp.usage_percent)}`}
                                                                style={{ width: `${Math.min(emp.usage_percent, 100)}%` }} />
                                                        </div>
                                                        <span className={`text-xs font-medium ${emp.usage_percent >= 100 ? 'text-red-600' : emp.usage_percent >= 80 ? 'text-amber-600' : 'text-green-600'}`}>
                                                            {emp.usage_percent}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">{emp.transaction_count}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1">
                                                        <Link href={`/admin/salary-deductions/${emp.id}`}
                                                            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground" title="View details">
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        <button onClick={() => { setEditingId(emp.id); setNewLimit(String(emp.limit)); }}
                                                            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground" title="Edit limit">
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Transactions Tab */
                    <div className="rounded-lg border bg-card shadow-sm">
                        <div className="border-b px-4 py-3">
                            <h2 className="font-semibold">Recent Deduction Transactions</h2>
                        </div>
                        {recentDeductions.length === 0 ? (
                            <p className="p-8 text-center text-sm text-muted-foreground">No deduction transactions yet</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Employee</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Order</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Amount</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Payroll</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentDeductions.map(d => (
                                            <tr key={d.id} className="border-b last:border-0">
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium">{d.user_name}</p>
                                                        <p className="text-xs text-muted-foreground">{d.employee_id} •{' '}
                                                            <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${roleBadge[d.user_role] || 'bg-gray-100'}`}>
                                                                {d.user_role}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-primary">{d.order_number}</td>
                                                <td className="px-4 py-3 font-medium">₱{formatPrice(d.amount)}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{d.payroll_month}/{d.payroll_year}</td>
                                                <td className="px-4 py-3">
                                                    <p className="text-xs">{d.date}</p>
                                                    <p className="text-xs text-muted-foreground">{d.time}</p>
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
        </AppLayout>
    );
}
