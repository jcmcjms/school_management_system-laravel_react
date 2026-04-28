import { useState, useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import { type CartItem, type MenuItem, type SharedData } from '@/types';

function getCartKey(userId?: number): string {
    return userId ? `sms_cart_${userId}` : 'sms_cart_guest';
}

function loadCart(userId?: number): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(getCartKey(userId));
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveCart(items: CartItem[], userId?: number) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(getCartKey(userId), JSON.stringify(items));
}

export function useCart() {
    const { auth } = usePage<SharedData>().props;
    const userId = auth?.user?.id;

    const [items, setItems] = useState<CartItem[]>(() => loadCart(userId));

    // Re-load cart when user changes (login/logout)
    useEffect(() => {
        setItems(loadCart(userId));
    }, [userId]);

    useEffect(() => {
        saveCart(items, userId);
    }, [items, userId]);

    const addItem = useCallback((menuItem: MenuItem, quantity = 1) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.menuItem.id === menuItem.id);
            if (existing) {
                return prev.map((i) =>
                    i.menuItem.id === menuItem.id
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                );
            }
            return [...prev, { menuItem, quantity }];
        });
    }, []);

    const updateQuantity = useCallback((menuItemId: number, quantity: number) => {
        setItems((prev) => {
            if (quantity <= 0) {
                return prev.filter((i) => i.menuItem.id !== menuItemId);
            }
            return prev.map((i) =>
                i.menuItem.id === menuItemId ? { ...i, quantity } : i
            );
        });
    }, []);

    const removeItem = useCallback((menuItemId: number) => {
        setItems((prev) => prev.filter((i) => i.menuItem.id !== menuItemId));
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const total = items.reduce(
        (sum, item) => sum + Number(item.menuItem.price) * item.quantity,
        0
    );

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        total,
        itemCount,
    };
}
