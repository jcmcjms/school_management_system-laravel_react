import { cn } from '@/lib/utils';

type StatusVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface StatusBadgeProps {
    status: string;
    variant?: StatusVariant;
    className?: string;
    capitalize?: boolean;
}

const variantClasses: Record<StatusVariant, string> = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

export function StatusBadge({
    status,
    variant = 'default',
    className,
    capitalize = true,
}: StatusBadgeProps) {
    const displayStatus = capitalize ? status.charAt(0).toUpperCase() + status.slice(1) : status;

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                variantClasses[variant],
                className
            )}
        >
            {displayStatus}
        </span>
    );
}

export function getStatusVariant(status: string): StatusVariant {
    const statusVariants: Record<string, StatusVariant> = {
        available: 'success',
        active: 'success',
        paid: 'success',
        completed: 'success',
        confirmed: 'success',
        ready: 'success',
        served: 'success',
        returned: 'success',
        fulfilled: 'success',

        pending: 'warning',
        preparing: 'info',
        borrowed: 'info',
        reserved: 'info',

        cancelled: 'danger',
        failed: 'danger',
        refunded: 'danger',
        overdue: 'danger',
        expired: 'danger',
        archived: 'default',
        unavailable: 'default',
    };

    return statusVariants[status.toLowerCase()] ?? 'default';
}

export function OrderStatusBadge({ status }: { status: string }) {
    const variant = getStatusVariant(status);
    return <StatusBadge status={status} variant={variant} />;
}

export function PaymentStatusBadge({ status }: { status: string }) {
    const variant = getStatusVariant(status);
    return <StatusBadge status={status} variant={variant} />;
}

export function InventoryStatusBadge({
    current,
    minimum,
}: {
    current: number;
    minimum: number;
}) {
    if (current <= 0) {
        return <StatusBadge status="Out of Stock" variant="danger" />;
    }
    if (current <= minimum) {
        return <StatusBadge status="Low Stock" variant="warning" />;
    }
    return <StatusBadge status="In Stock" variant="success" />;
}
