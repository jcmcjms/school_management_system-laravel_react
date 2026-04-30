import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: LucideIcon;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({
    title = 'No data found',
    description,
    icon: Icon,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-12 text-center',
                className
            )}
        >
            {Icon && (
                <div className="rounded-full bg-muted p-4 mb-4">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && (
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
