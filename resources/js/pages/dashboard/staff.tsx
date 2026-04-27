import { Head, usePage, useForm } from '@inertiajs/react';
import { Package, Check, Clock, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

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

interface InventoryItem {
    id: number;
    name: string;
    current_quantity: number;
    minimum_quantity: number;
}

interface StatusCounts {
    pending: number;
    preparing: number;
    ready: number;
    served: number;
}

interface StaffDashboardProps {
    orders: Order[];
    preparingOrders: Order[];
    readyOrders: Order[];
    lowStockInventory: InventoryItem[];
    statusCounts: StatusCounts;
}

const formatPrice = (price: number | string): string => {
    return Number(price).toFixed(2);
};

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/staff/dashboard' },
];

export default function StaffDashboard() {
    const { orders, preparingOrders, readyOrders, lowStockInventory, statusCounts } = usePage<StaffDashboardProps>().props;

    const updateStatus = (orderId: number, newStatus: string) => {
        const routeUrl = route('staff.orders.update', { order: orderId });
        // Using Inertia patch - simplified for demo
        console.log('Update order', orderId, 'to', newStatus);
    };

    const handleStartPreparing = (orderId: number) => {
        updateStatus(orderId, 'preparing');
    };

    const handleMarkReady = (orderId: number) => {
        updateStatus(orderId, 'ready');
    };

    const handleMarkServed = (orderId: number) => {
        updateStatus(orderId, 'served');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Dashboard - Kitchen" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Kitchen Dashboard</h1>
                        <p className="text-muted-foreground">Manage orders and preparation</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-6 shadow-sm dark:bg-yellow-950">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-700">New Orders</p>
                                <p className="text-3xl font-bold text-yellow-700">{statusCounts.pending}</p>
                            </div>
                            <div className="rounded-full bg-yellow-500/10 p-3">
                                <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-blue-500 bg-blue-50 p-6 shadow-sm dark:bg-blue-950">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">Preparing</p>
                                <p className="text-3xl font-bold text-blue-700">{statusCounts.preparing}</p>
                            </div>
                            <div className="rounded-full bg-blue-500/10 p-3">
                                <Package className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-green-500 bg-green-50 p-6 shadow-sm dark:bg-green-950">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">Ready for Pickup</p>
                                <p className="text-3xl font-bold text-green-700">{statusCounts.ready}</p>
                            </div>
                            <div className="rounded-full bg-green-500/10 p-3">
                                <Check className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Served Today</p>
                                <p className="text-3xl font-bold">{statusCounts.served}</p>
                            </div>
                            <div className="rounded-full bg-primary/10 p-3">
                                <Check className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">New Orders</h2>
                        {orders.length === 0 ? (
                            <p className="text-muted-foreground">No new orders</p>
                        ) : (
                            <div className="space-y-3">
                                {orders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between rounded-md border p-3">
                                        <div>
                                            <p className="font-medium">{order.order_number}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {order.items?.map((item: OrderItem) => `${item.quantity}x ${item.menuItem?.name}`).join(', ')}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleStartPreparing(order.id)}
                                            className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                                        >
                                            Start
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">Preparing</h2>
                        {preparingOrders.length === 0 ? (
                            <p className="text-muted-foreground">No orders preparing</p>
                        ) : (
                            <div className="space-y-3">
                                {preparingOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between rounded-md border border-blue-500 bg-blue-50 p-3 dark:bg-blue-950">
                                        <div>
                                            <p className="font-medium">{order.order_number}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {order.items?.map((item: OrderItem) => `${item.quantity}x ${item.menuItem?.name}`).join(', ')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleMarkReady(order.id)}
                                            className="rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                                        >
                                            Ready
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold">Ready for Pickup</h2>
                    {readyOrders.length === 0 ? (
                        <p className="text-muted-foreground">No orders ready</p>
                    ) : (
                        <div className="space-y-3">
                            {readyOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between rounded-md border border-green-500 bg-green-50 p-3 dark:bg-green-950">
                                    <div>
                                        <p className="font-medium">{order.order_number}</p>
                                        <p className="text-sm text-muted-foreground">Customer: {order.user?.name}</p>
                                    </div>
                                    <button
                                        onClick={() => handleMarkServed(order.id)}
                                        className="rounded-md bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
                                    >
                                        Served
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {lowStockInventory.length > 0 && (
                    <div className="rounded-lg border border-red-500 bg-red-50 p-6 shadow-sm dark:bg-red-950">
                        <h2 className="mb-4 text-xl font-semibold text-red-700">Low Stock Alerts</h2>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {lowStockInventory.map((item) => (
                                <div key={item.id} className="flex items-center justify-between rounded-md border border-red-300 bg-white p-2 dark:border-red-800 dark:bg-red-900">
                                    <span>{item.name}</span>
                                    <span className="text-sm font-medium text-red-700">
                                        {item.current_quantity} / {item.minimum_quantity}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}