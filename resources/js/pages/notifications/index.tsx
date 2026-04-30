import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, Bell, BellRing, Check, CheckCircle, ChefHat, CreditCard, Package, QrCode, ShoppingCart, XCircle } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { type AppNotification, type BreadcrumbItem, type PaginatedData } from '@/types';

interface NotificationsPageProps {
    notifications: PaginatedData<AppNotification>;
    unreadCount: number;
}

const iconMap: Record<string, React.ReactNode> = {
    'shopping-cart': <ShoppingCart className="h-5 w-5" />,
    'chef-hat': <ChefHat className="h-5 w-5" />,
    'bell-ring': <BellRing className="h-5 w-5" />,
    'credit-card': <CreditCard className="h-5 w-5" />,
    'alert-triangle': <AlertTriangle className="h-5 w-5" />,
    'qr-code': <QrCode className="h-5 w-5" />,
    'x-circle': <XCircle className="h-5 w-5" />,
    'check-circle': <CheckCircle className="h-5 w-5" />,
    'utensils-crossed': <ChefHat className="h-5 w-5" />,
    package: <Package className="h-5 w-5" />,
};

const typeColors: Record<string, string> = {
    order_status: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    payment: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    new_order: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    order_cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    low_stock: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    reservation: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
};

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Notifications', href: '/notifications' }];

export default function NotificationsIndex() {
    const { notifications, unreadCount } = usePage<NotificationsPageProps>().props;

    const markAsRead = (id: string) => {
        router.patch(`/notifications/${id}/read`, {}, { preserveScroll: true });
    };

    const markAllRead = () => {
        router.post('/notifications/mark-all-read', {}, { preserveScroll: true });
    };

    const handleClick = (n: AppNotification) => {
        if (!n.read_at) {
            markAsRead(n.id);
        }
        router.visit(n.data.url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                        <p className="text-muted-foreground">
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="hover:bg-accent inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
                        >
                            <Check className="h-4 w-4" /> Mark all as read
                        </button>
                    )}
                </div>

                {notifications.data.length === 0 ? (
                    <div className="bg-card rounded-lg border p-12 text-center shadow-sm">
                        <Bell className="text-muted-foreground mx-auto h-12 w-12" />
                        <p className="text-muted-foreground mt-4 text-lg">No notifications yet</p>
                        <p className="text-muted-foreground mt-1 text-sm">You'll be notified when something important happens</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifications.data.map((n) => {
                            const isUnread = !n.read_at;
                            const icon = iconMap[n.data.icon] || <Bell className="h-5 w-5" />;
                            const colorClass = typeColors[n.data.type] || 'bg-gray-100 text-gray-700';

                            return (
                                <button
                                    key={n.id}
                                    onClick={() => handleClick(n)}
                                    className={`bg-card flex w-full items-start gap-4 rounded-lg border p-4 text-left shadow-sm transition-all hover:shadow-md ${isUnread ? 'border-primary/30 bg-primary/5' : ''}`}
                                >
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}>{icon}</div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm ${isUnread ? 'font-bold' : 'font-medium'}`}>{n.data.title}</p>
                                            {isUnread && <span className="bg-primary h-2.5 w-2.5 rounded-full" />}
                                        </div>
                                        <p className="text-muted-foreground mt-0.5 text-sm">{n.data.message}</p>
                                        <p className="text-muted-foreground/70 mt-1 text-xs">{formatDate(n.created_at)}</p>
                                    </div>
                                    {isUnread && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(n.id);
                                            }}
                                            className="text-muted-foreground hover:bg-accent hover:text-foreground shrink-0 rounded-md border p-1.5 transition-colors"
                                            title="Mark as read"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                    )}
                                </button>
                            );
                        })}

                        {/* Pagination */}
                        {notifications.last_page > 1 && (
                            <div className="flex justify-center gap-2 pt-4">
                                {Array.from({ length: notifications.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link
                                        key={page}
                                        href={`/notifications?page=${page}`}
                                        className={`rounded-md px-3 py-1 text-sm ${
                                            page === notifications.current_page ? 'bg-primary text-primary-foreground' : 'hover:bg-accent border'
                                        }`}
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
