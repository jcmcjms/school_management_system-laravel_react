import { Head } from '@inertiajs/react';
import { CreditCard, DollarSign, ShoppingCart, Wallet } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    subtext?: string;
}

const StatsCard = ({ title, value, icon, subtext }: StatsCardProps) => (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
                {subtext && <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>}
            </div>
            <div className="rounded-full bg-primary/10 p-3">{icon}</div>
        </div>
    </div>
);

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/faculty/dashboard' },
];

export default function FacultyDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Faculty Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
                    <p className="text-muted-foreground">Manage your meal orders and deductions</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard title="Monthly Limit" value="₱2,000" icon={<Wallet className="h-5 w-5 text-primary" />} subtext="January 2026" />
                    <StatsCard title="Used" value="₱450" icon={<CreditCard className="h-5 w-5 text-primary" />} subtext="This month" />
                    <StatsCard title="Remaining" value="₱1,550" icon={<DollarSign className="h-5 w-5 text-primary" />} />
                    <StatsCard title="Orders" value="3" icon={<ShoppingCart className="h-5 w-5 text-primary" />} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">Salary Deduction Summary</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">January 2026</span>
                                    <span className="font-medium">₱450.00</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-secondary">
                                    <div className="h-2 rounded-full bg-primary" style={{ width: '22.5%' }} />
                                </div>
                                <p className="text-xs text-muted-foreground">22.5% of ₱2,000 limit used</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">December 2025</span>
                                    <span className="font-medium">₱680.00</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-secondary">
                                    <div className="h-2 rounded-full bg-primary" style={{ width: '34%' }} />
                                </div>
                                <p className="text-xs text-muted-foreground">34% of ₱2,000 limit used</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">Recent Orders</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b pb-2">
                                <div>
                                    <p className="font-medium">ORD-20260120-ABC123</p>
                                    <p className="text-sm text-muted-foreground">Jan 20, 2026</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">₱150.00</p>
                                    <p className="text-xs text-muted-foreground">Salary Deduction</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                                <div>
                                    <p className="font-medium">ORD-20260118-DEF456</p>
                                    <p className="text-sm text-muted-foreground">Jan 18, 2026</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">₱300.00</p>
                                    <p className="text-xs text-muted-foreground">GCash</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <a href="/menu" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Browse Menu
                    </a>
                </div>
            </div>
        </AppLayout>
    );
}