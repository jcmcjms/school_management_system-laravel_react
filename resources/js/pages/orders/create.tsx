import { Head, router, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type UserRole } from '@/types';

interface DeductionInfo {
    limit: number;
    used: number;
    remaining: number;
}

interface CreateOrderProps {
    deductionInfo: DeductionInfo | null;
    userRole: UserRole;
}

const formatPrice = (price: number | string): string => Number(price).toFixed(2);

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Menu', href: '/menu' },
    { title: 'Place Order', href: '/orders/create' },
];

export default function CreateOrder() {
    const { deductionInfo, userRole } = usePage<CreateOrderProps>().props;
    const { items, updateQuantity, removeItem, clearCart, total } = useCart();
    const [paymentMethod, setPaymentMethod] = useState<string>('cash');
    const [pickupTime, setPickupTime] = useState('');
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const canUseSalaryDeduction = !!deductionInfo && deductionInfo.limit > 0;
    const deductionInsufficient = canUseSalaryDeduction && deductionInfo && total > deductionInfo.remaining;

    const hasSoldOutItem = items.some((item) => item.menuItem.availability_status === 'sold_out');
    const hasLimitedItem = items.some((item) => item.menuItem.availability_status === 'limited');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) return;
        if (!pickupTime) {
            setErrors({ pickup_time: 'Please select a pickup time before placing your order.' });
            return;
        }

        setProcessing(true);
        router.post(
            '/orders',
            {
                items: items.map((item) => ({
                    menu_item_id: item.menuItem.id,
                    quantity: item.quantity,
                })),
                payment_method: paymentMethod,
                pickup_time: pickupTime || null,
                notes: notes || null,
            },
            {
                onSuccess: () => clearCart(),
                onError: (errs) => {
                    setErrors(errs as Record<string, string>);
                    setProcessing(false);
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    if (items.length === 0) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Place Order" />
                <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
                    <ShoppingCart className="text-muted-foreground h-16 w-16" />
                    <h2 className="text-2xl font-bold">Your cart is empty</h2>
                    <p className="text-muted-foreground">Browse the menu to add items to your cart.</p>
                    <a
                        href="/menu"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Browse Menu
                    </a>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Place Order" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <h1 className="text-3xl font-bold tracking-tight">Place Your Order</h1>

                {hasSoldOutItem && (
                    <div className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium">
                            Some items in your cart are no longer available. Please remove them before placing your order.
                        </p>
                    </div>
                )}

                {hasLimitedItem && !hasSoldOutItem && (
                    <div className="flex items-center gap-3 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium">Some items are running low on stock. We recommend ordering soon to ensure availability.</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="bg-card rounded-lg border p-6 shadow-sm">
                                <h2 className="mb-4 text-xl font-semibold">Order Items</h2>
                                <div className="space-y-4">
                                    {items.map((item) => {
                                        const isSoldOut = item.menuItem.availability_status === 'sold_out';
                                        const isLimited = item.menuItem.availability_status === 'limited';
                                        return (
                                            <div
                                                key={item.menuItem.id}
                                                className={`flex items-center justify-between rounded-md border p-4 ${isSoldOut ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950' : ''}`}
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">{item.menuItem.name}</p>
                                                        {isSoldOut && (
                                                            <Badge variant="destructive" className="text-xs">
                                                                Sold Out
                                                            </Badge>
                                                        )}
                                                        {isLimited && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Limited
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-muted-foreground text-sm">₱{formatPrice(item.menuItem.price)} each</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                                                        className="hover:bg-accent rounded-md border p-1"
                                                        disabled={isSoldOut}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                                                        className="hover:bg-accent rounded-md border p-1"
                                                        disabled={isSoldOut}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                    <span className="w-20 text-right font-medium">
                                                        ₱{formatPrice(Number(item.menuItem.price) * item.quantity)}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.menuItem.id)}
                                                        className="rounded-md p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {errors.items && <p className="mt-2 text-sm text-red-600">{errors.items}</p>}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="space-y-4">
                            <div className="bg-card rounded-lg border p-6 shadow-sm">
                                <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>₱{formatPrice(total)}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                        <span>Total</span>
                                        <span>₱{formatPrice(total)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card rounded-lg border p-6 shadow-sm">
                                <h2 className="mb-4 text-xl font-semibold">Payment Method</h2>
                                <div className="space-y-2">
                                    <label
                                        className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cash"
                                            checked={paymentMethod === 'cash'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="accent-primary"
                                        />
                                        <div>
                                            <p className="font-medium">Cash</p>
                                            <p className="text-muted-foreground text-xs">Pay at the counter</p>
                                        </div>
                                    </label>
                                    <label
                                        className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors ${paymentMethod === 'gcash' ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="gcash"
                                            checked={paymentMethod === 'gcash'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="accent-primary"
                                        />
                                        <div>
                                            <p className="font-medium">GCash</p>
                                            <p className="text-muted-foreground text-xs">Show GCash transfer at the counter</p>
                                        </div>
                                    </label>
                                    {canUseSalaryDeduction && (
                                        <label
                                            className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors ${paymentMethod === 'salary_deduction' ? 'border-primary bg-primary/5' : 'hover:bg-accent'} ${deductionInsufficient && paymentMethod === 'salary_deduction' ? 'border-red-500' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="salary_deduction"
                                                checked={paymentMethod === 'salary_deduction'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="accent-primary"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium">Salary Deduction</p>
                                                <p className="text-muted-foreground text-xs">
                                                    Remaining: ₱{formatPrice(deductionInfo!.remaining)} / ₱{formatPrice(deductionInfo!.limit)}
                                                </p>
                                                {deductionInsufficient && paymentMethod === 'salary_deduction' && (
                                                    <p className="mt-1 text-xs text-red-600">Insufficient limit for this order.</p>
                                                )}
                                            </div>
                                        </label>
                                    )}
                                </div>
                                {errors.payment_method && <p className="mt-2 text-sm text-red-600">{errors.payment_method}</p>}
                            </div>

                            <div className="bg-card rounded-lg border p-6 shadow-sm">
                                <h2 className="mb-4 text-xl font-semibold">
                                    Pickup Time <span className="text-red-500">*</span>
                                </h2>
                                <input
                                    type="time"
                                    value={pickupTime}
                                    onChange={(e) => {
                                        setPickupTime(e.target.value);
                                        setErrors((prev) => {
                                            const { pickup_time, ...rest } = prev;
                                            return rest;
                                        });
                                    }}
                                    className={`bg-background w-full rounded-md border px-3 py-2 text-sm ${errors.pickup_time ? 'border-red-500' : ''}`}
                                />
                                {errors.pickup_time ? (
                                    <p className="mt-1 text-xs text-red-600">{errors.pickup_time}</p>
                                ) : (
                                    <p className="text-muted-foreground mt-1 text-xs">Required — select when you'd like to pick up your order</p>
                                )}
                            </div>

                            <div className="bg-card rounded-lg border p-6 shadow-sm">
                                <h2 className="mb-4 text-xl font-semibold">Notes</h2>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Special instructions..."
                                    className="bg-background w-full rounded-md border px-3 py-2 text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    processing || !pickupTime || (paymentMethod === 'salary_deduction' && !!deductionInsufficient) || hasSoldOutItem
                                }
                                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md py-3 text-lg font-medium disabled:opacity-50"
                            >
                                {hasSoldOutItem ? 'Remove Sold Out Items' : processing ? 'Processing...' : `Place Order — ₱${formatPrice(total)}`}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
