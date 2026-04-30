import { Head, Link, usePage } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Order, type PaginatedData } from '@/types';

interface OrdersIndexProps {
    orders: PaginatedData<Order>;
}

const formatPrice = (p: number | string) => Number(p).toFixed(2);
const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

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
            <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Orders</h1>
                        <p className="text-muted-foreground text-sm">View your order history</p>
                    </div>
                    <a
                        href="/menu"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-3 py-2 text-sm font-medium sm:px-4"
                    >
                        <ShoppingCart className="mr-2 h-4 w-4" /> New Order
                    </a>
                </div>

                {orders.data.length === 0 ? (
                    <div className="bg-card rounded-lg border p-8 text-center shadow-sm sm:p-12">
                        <ShoppingCart className="text-muted-foreground mx-auto h-10 w-10 sm:h-12 sm:w-12" />
                        <p className="text-muted-foreground mt-3 text-base sm:mt-4 sm:text-lg">No orders yet</p>
                        <a
                            href="/menu"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium sm:mt-4"
                        >
                            Browse Menu
                        </a>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.data.map((order) => (
                            <Link
                                key={order.id}
                                href={`/orders/${order.id}`}
                                className="bg-card block rounded-lg border p-3 shadow-sm transition-all hover:shadow-md sm:p-4"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold">{order.order_number}</p>
                                        <p className="text-muted-foreground text-xs sm:text-sm">{formatDate(order.created_at)}</p>
                                        <p className="text-muted-foreground mt-1 truncate text-xs sm:text-sm">
                                            {order.items?.map((i) => `${i.quantity}x ${i.menuItem?.name || i.menu_item?.name || 'Item'}`).join(', ')}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-base font-bold sm:text-lg">₱{formatPrice(order.total)}</p>
                                        <span
                                            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status] || ''}`}
                                        >
                                            {order.status}
                                        </span>
                                        <p className="text-muted-foreground mt-1 text-xs capitalize">{order.payment_method?.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Pagination */}
                        {orders.last_page > 1 && (
                            <div className="flex justify-center gap-2 pt-4">
                                {Array.from({ length: orders.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link
                                        key={page}
                                        href={`/orders?page=${page}`}
                                        className={`rounded-md px-3 py-1 text-sm ${page === orders.current_page ? 'bg-primary text-primary-foreground' : 'hover:bg-accent border'}`}
                                    >
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
