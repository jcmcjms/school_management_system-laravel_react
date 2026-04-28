import { Head, Link, usePage } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Order, type PaginatedData } from '@/types';

interface OrdersIndexProps {
    orders: PaginatedData<Order>;
}

const formatPrice = (p: number | string) => Number(p).toFixed(2);
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    preparing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    ready: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    served: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'My Orders', href: '/orders' }];

export default function OrdersIndex() {
    const { orders } = usePage<OrdersIndexProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Orders" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
                        <p className="text-muted-foreground">View your order history</p>
                    </div>
                    <a href="/menu" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        <ShoppingCart className="mr-2 h-4 w-4" /> New Order
                    </a>
                </div>

                {orders.data.length === 0 ? (
                    <div className="rounded-lg border bg-card p-12 text-center shadow-sm">
                        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg text-muted-foreground">No orders yet</p>
                        <a href="/menu" className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Browse Menu</a>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.data.map((order) => (
                            <Link key={order.id} href={`/orders/${order.id}`} className="block rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">{order.order_number}</p>
                                        <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {order.items?.map((i) => `${i.quantity}x ${i.menuItem?.name || i.menu_item?.name || 'Item'}`).join(', ')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold">₱{formatPrice(order.total)}</p>
                                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status] || ''}`}>{order.status}</span>
                                        <p className="mt-1 text-xs text-muted-foreground capitalize">{order.payment_method?.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Pagination */}
                        {orders.last_page > 1 && (
                            <div className="flex justify-center gap-2 pt-4">
                                {Array.from({ length: orders.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link key={page} href={`/orders?page=${page}`}
                                        className={`rounded-md px-3 py-1 text-sm ${page === orders.current_page ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'}`}>
                                        {page}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
