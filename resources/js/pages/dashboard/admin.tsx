import { Head } from '@inertiajs/react';
import { ChefHat, Package, Plus, ShoppingCart, Users } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description?: string;
}

const StatsCard = ({ title, value, icon, description }: StatsCardProps) => (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
                {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
            </div>
            <div className="rounded-full bg-primary/10 p-3">{icon}</div>
        </div>
    </div>
);

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
];

export default function AdminDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage your restaurant operations</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard title="Today's Orders" value="24" icon={<ShoppingCart className="h-5 w-5 text-primary" />} description="+12% from yesterday" />
                    <StatsCard title="Revenue" value="₱4,250" icon={<Plus className="h-5 w-5 text-primary" />} description="+8% from yesterday" />
                    <StatsCard title="Menu Items" value="15" icon={<Package className="h-5 w-5 text-primary" />} />
                    <StatsCard title="Active Users" value="8" icon={<Users className="h-5 w-5 text-primary" />} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
                        <div className="grid gap-2">
                            <a href="/admin/menu" className="flex items-center gap-2 rounded-md p-2 hover:bg-muted">
                                <ChefHat className="h-4 w-4" />
                                <span>Manage Menu</span>
                            </a>
                            <a href="/admin/orders" className="flex items-center gap-2 rounded-md p-2 hover:bg-muted">
                                <ShoppingCart className="h-4 w-4" />
                                <span>View Orders</span>
                            </a>
                            <a href="/admin/inventory" className="flex items-center gap-2 rounded-md p-2 hover:bg-muted">
                                <Package className="h-4 w-4" />
                                <span>Inventory</span>
                            </a>
                            <a href="/admin/users" className="flex items-center gap-2 rounded-md p-2 hover:bg-muted">
                                <Users className="h-4 w-4" />
                                <span>Manage Users</span>
                            </a>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">Recent Orders</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b pb-2">
                                <div>
                                    <p className="font-medium">ORD-20260101-ABC123</p>
                                    <p className="text-sm text-muted-foreground">John Doe</p>
                                </div>
                                <span className="text-sm font-medium">₱350.00</span>
                            </div>
                            <div className="flex items-center justify-between border-b pb-2">
                                <div>
                                    <p className="font-medium">ORD-20260101-DEF456</p>
                                    <p className="text-sm text-muted-foreground">Jane Smith</p>
                                </div>
                                <span className="text-sm font-medium">₱280.00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}