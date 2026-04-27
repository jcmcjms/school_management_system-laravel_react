import { Head } from '@inertiajs/react';
import { ChefHat, Package, ShoppingCart, Users } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

const StatsCard = ({ title, value, icon }: StatsCardProps) => (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">{icon}</div>
        </div>
    </div>
);

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/staff/dashboard' },
];

export default function StaffDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
                    <p className="text-muted-foreground">Kitchen and order management</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard title="Pending Orders" value="8" icon={<ShoppingCart className="h-5 w-5 text-primary" />} />
                    <StatsCard title="Preparing" value="3" icon={<ChefHat className="h-5 w-5 text-primary" />} />
                    <StatsCard title="Ready" value="12" icon={<Package className="h-5 w-5 text-primary" />} />
                    <StatsCard title="Served" value="45" icon={<ShoppingCart className="h-5 w-5 text-primary" />} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">New Orders</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div>
                                    <p className="font-medium">ORD-20260101-ABC123</p>
                                    <p className="text-sm text-muted-foreground">2x Chicken Adobo</p>
                                </div>
                                <button className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground">
                                    Prepare
                                </button>
                            </div>
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div>
                                    <p className="font-medium">ORD-20260101-DEF456</p>
                                    <p className="text-sm text-muted-foreground">1x Pork Sinigang</p>
                                </div>
                                <button className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground">
                                    Prepare
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">Inventory Alerts</h2>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between rounded-md border border-yellow-500 bg-yellow-50 p-3 dark:bg-yellow-950">
                                <span>Chicken Breast</span>
                                <span className="text-sm font-medium text-yellow-700">Low Stock</span>
                            </div>
                            <div className="flex items-center justify-between rounded-md border border-red-500 bg-red-50 p-3 dark:bg-red-950">
                                <span>Rice</span>
                                <span className="text-sm font-medium text-red-700">Out of Stock</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}