import { useNotifications } from '@/hooks/use-notifications';
import { type AppNotification } from '@/types';
import { router } from '@inertiajs/react';
import { AlertTriangle, Bell, BellRing, CheckCircle, ChefHat, CreditCard, Package, QrCode, ShoppingCart, XCircle } from 'lucide-react';
import { useState } from 'react';

const iconMap: Record<string, React.ReactNode> = {
    'shopping-cart': <ShoppingCart className="h-4 w-4" />,
    'chef-hat': <ChefHat className="h-4 w-4" />,
    'bell-ring': <BellRing className="h-4 w-4" />,
    'credit-card': <CreditCard className="h-4 w-4" />,
    'alert-triangle': <AlertTriangle className="h-4 w-4" />,
    'qr-code': <QrCode className="h-4 w-4" />,
    'x-circle': <XCircle className="h-4 w-4" />,
    'check-circle': <CheckCircle className="h-4 w-4" />,
    'utensils-crossed': <ChefHat className="h-4 w-4" />,
    package: <Package className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
    order_status: 'bg-blue-500',
    payment: 'bg-green-500',
    new_order: 'bg-yellow-500',
    order_cancelled: 'bg-red-500',
    low_stock: 'bg-orange-500',
    reservation: 'bg-purple-500',
};

function NotificationItem({ notification, onNavigate }: { notification: AppNotification; onNavigate: (n: AppNotification) => void }) {
    const isUnread = !notification.read_at;
    const icon = iconMap[notification.data.icon] || <Bell className="h-4 w-4" />;
    const dotColor = typeColors[notification.data.type] || 'bg-gray-500';

    return (
        <button
            onClick={() => onNavigate(notification)}
            className={`hover:bg-accent flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${isUnread ? 'bg-accent/50' : ''}`}
        >
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isUnread ? dotColor + '/15' : 'bg-muted'}`}>
                <span className={isUnread ? 'text-foreground' : 'text-muted-foreground'}>{icon}</span>
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <p className={`truncate text-sm ${isUnread ? 'font-semibold' : 'text-muted-foreground font-medium'}`}>
                        {notification.data.title}
                    </p>
                    {isUnread && <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />}
                </div>
                <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">{notification.data.message}</p>
                <p className="text-muted-foreground/70 mt-1 text-xs">{notification.time_ago}</p>
            </div>
        </button>
    );
}

export function NotificationBell() {
    const { unreadCount, notifications, refetch } = useNotifications(15000);
    const [open, setOpen] = useState(false);

    const handleNavigate = (notification: AppNotification) => {
        // Mark as read then navigate
        if (!notification.read_at) {
            fetch(`/notifications/${notification.id}/read`, {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            }).then(() => refetch());
        }
        setOpen(false);
        router.visit(notification.data.url);
    };

    const handleMarkAllRead = () => {
        fetch('/notifications/mark-all-read', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                Accept: 'application/json',
            },
            credentials: 'same-origin',
        }).then(() => refetch());
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="text-muted-foreground hover:bg-accent hover:text-foreground relative rounded-md p-2 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                    {/* Dropdown */}
                    <div className="bg-card absolute top-full right-0 z-50 mt-2 w-80 rounded-lg border shadow-xl sm:w-96">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <h3 className="font-semibold">Notifications</h3>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllRead} className="text-primary text-xs hover:underline">
                                        Mark all read
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    <Bell className="text-muted-foreground/50 mx-auto h-8 w-8" />
                                    <p className="text-muted-foreground mt-2 text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="p-1">
                                    {notifications.map((n) => (
                                        <NotificationItem key={n.id} notification={n} onNavigate={handleNavigate} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="border-t px-4 py-2">
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    router.visit('/notifications');
                                }}
                                className="text-primary hover:bg-accent w-full rounded-md py-1.5 text-center text-sm font-medium"
                            >
                                View all notifications
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
