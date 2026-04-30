import { Head, Link, usePage } from '@inertiajs/react';
import { ChefHat, DollarSign, Package, Plus, ShoppingCart, Users } from 'lucide-react';

import { LiveClock } from '@/components/live-clock';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Stats {
    todayOrders: number;
    todayRevenue: number;
    totalUsers: number;
    activeUsers: number;
    totalMenuItems: number;
    totalCategories: number;
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

interface OrderUser {
    id: number;
    name: string;
}

interface Order {
    id: number;
    order_number: string;
    total: number;
    status: string;
    created_at: string;
    user: OrderUser;
    items: OrderItem[];
}

interface LowStockItem {
    id: number;
    name: string;
    available_quantity: number;
    slug: string;
}

interface InventoryItem {
    id: number;
    name: string;
    current_quantity: number;
    minimum_quantity: number;
    sku: string;
}

interface OrderStatusCounts {
    pending: number;
    preparing: number;
    ready: number;
    served: number;
}

interface AdminDashboardProps {
    stats: Stats;
    recentOrders: Order[];
    lowStockItems: LowStockItem[];
    lowStockInventory: InventoryItem[];
    orderStatusCounts: OrderStatusCounts;
}

const formatPrice = (price: number | string): string => Number(price).toFixed(2);
const formatTime = (d: string) => new Date(d).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/admin/dashboard' }];

export default function AdminDashboard() {
    const { stats, recentOrders, lowStockItems, lowStockInventory, orderStatusCounts } = usePage<AdminDashboardProps>().props;
    const { auth } = usePage<{ auth: { role: string } }>().props;
    const isManager = auth.role === 'manager';
    const title = isManager ? 'Manager Dashboard' : 'Admin Dashboard';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
                        <p className="text-muted-foreground text-sm sm:text-base">Manage your canteen operations</p>
                    </div>
                </div>

                <LiveClock />

                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <div className="bg-card rounded-lg border p-3 shadow-sm sm:p-4 lg:p-6">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <p className="text-muted-foreground text-xs font-medium sm:text-sm">Today's Orders</p>
                                <p className="text-2xl font-bold sm:text-3xl">{stats.todayOrders}</p>
                            </div>
                            <div className="bg-primary/10 rounded-full p-2 sm:p-3">
                                <ShoppingCart className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-lg border p-3 shadow-sm sm:p-4 lg:p-6">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <p className="text-muted-foreground text-xs font-medium sm:text-sm">Today's Revenue</p>
                                <p className="text-2xl font-bold sm:text-3xl">₱{formatPrice(stats.todayRevenue)}</p>
                            </div>
                            <div className="bg-primary/10 rounded-full p-2 sm:p-3">
                                <Plus className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-lg border p-3 shadow-sm sm:p-4 lg:p-6">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <p className="text-muted-foreground text-xs font-medium sm:text-sm">Menu Items</p>
                                <p className="text-2xl font-bold sm:text-3xl">{stats.totalMenuItems}</p>
                            </div>
                            <div className="bg-primary/10 rounded-full p-2 sm:p-3">
                                <Package className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-card rounded-lg border p-3 shadow-sm sm:p-4 lg:p-6">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <p className="text-muted-foreground text-xs font-medium sm:text-sm">Active Users</p>
                                <p className="text-2xl font-bold sm:text-3xl">
                                    {stats.activeUsers}/{stats.totalUsers}
                                </p>
                            </div>
                            <div className="bg-primary/10 rounded-full p-2 sm:p-3">
                                <Users className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <div className="bg-card rounded-lg border p-4 shadow-sm">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">{orderStatusCounts.pending}</p>
                            <p className="text-muted-foreground text-sm">Pending</p>
                        </div>
                    </div>
                    <div className="bg-card rounded-lg border p-4 shadow-sm">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{orderStatusCounts.preparing}</p>
                            <p className="text-muted-foreground text-sm">Preparing</p>
                        </div>
                    </div>
                    <div className="bg-card rounded-lg border p-4 shadow-sm">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{orderStatusCounts.ready}</p>
                            <p className="text-muted-foreground text-sm">Ready</p>
                        </div>
                    </div>
                    <div className="bg-card rounded-lg border p-4 shadow-sm">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-600">{orderStatusCounts.served}</p>
                            <p className="text-muted-foreground text-sm">Served</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">Recent Orders</h2>
                        {recentOrders.length === 0 ? (
                            <p className="text-muted-foreground">No orders yet</p>
                        ) : (
                            <div className="space-y-3">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between border-b pb-2">
                                        <div>
                                            <Link href={`/orders/${order.id}`} className="text-primary font-medium hover:underline">
                                                {order.order_number}
                                            </Link>
                                            <p className="text-muted-foreground text-sm">
                                                {order.user?.name} — {formatTime(order.created_at)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">₱{formatPrice(order.total)}</p>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : order.status === 'preparing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : order.status === 'ready' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-card rounded-lg border p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">Menu Items - Low Stock</h2>
                        {lowStockItems.length === 0 ? (
                            <p className="text-muted-foreground">All items are well stocked</p>
                        ) : (
                            <div className="space-y-2">
                                {lowStockItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between rounded-md border border-yellow-500 bg-yellow-50 p-2 dark:bg-yellow-950"
                                    >
                                        <span>{item.name}</span>
                                        <span className="text-sm font-medium text-yellow-700">{item.available_quantity} left</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-card rounded-lg border p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold">Inventory Alerts</h2>
                    {lowStockInventory.length === 0 ? (
                        <p className="text-muted-foreground">Inventory is well stocked</p>
                    ) : (
                        <div className="grid gap-2 sm:grid-cols-2">
                            {lowStockInventory.map((item) => (
                                <div
                                    key={item.id}
                                    className={`flex items-center justify-between rounded-md border p-2 ${item.current_quantity <= 0 ? 'border-red-500 bg-red-50 dark:bg-red-950' : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'}`}
                                >
                                    <span>
                                        {item.name} ({item.sku})
                                    </span>
                                    <span className={`text-sm font-medium ${item.current_quantity <= 0 ? 'text-red-700' : 'text-yellow-700'}`}>
                                        {item.current_quantity} / {item.minimum_quantity}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                    <Link
                        href="/admin/menu"
                        className="bg-card hover:bg-accent inline-flex items-center rounded-md border px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm"
                    >
                        <ChefHat className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> Menu
                    </Link>
                    <Link
                        href="/admin/inventory"
                        className="bg-card hover:bg-accent inline-flex items-center rounded-md border px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm"
                    >
                        <Package className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> Inventory
                    </Link>
                    <Link
                        href="/admin/revenue"
                        className="bg-card hover:bg-accent inline-flex items-center rounded-md border px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm"
                    >
                        <DollarSign className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> Revenue
                    </Link>
                    <Link
                        href="/menu"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm"
                    >
                        <ShoppingCart className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> Browse
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
