import { useState, useEffect, useCallback } from 'react';
import { type AppNotification } from '@/types';

interface PollResponse {
    unread_count: number;
    latest: AppNotification[];
}

export function useNotifications(intervalMs = 15000) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications/poll', {
                headers: { 'Accept': 'application/json' },
                credentials: 'same-origin',
            });
            if (res.ok) {
                const data: PollResponse = await res.json();
                setUnreadCount(data.unread_count);
                setNotifications(data.latest);
            }
        } catch {
            // Silently fail on network errors
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const id = setInterval(fetchNotifications, intervalMs);
        return () => clearInterval(id);
    }, [fetchNotifications, intervalMs]);

    return { unreadCount, notifications, loading, refetch: fetchNotifications };
}
