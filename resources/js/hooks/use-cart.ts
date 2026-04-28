import { useState, useEffect, useCallback } from 'react';
import { type CartItem, type MenuItem } from '@/types';

const CART_KEY = 'sms_cart';

function loadCart(): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(CART_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveCart(items: CartItem[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function useCart() {
    const [items, setItems] = useState<CartItem[]>(loadCart);

    useEffect(() => {
        saveCart(items);
    }, [items]);

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
