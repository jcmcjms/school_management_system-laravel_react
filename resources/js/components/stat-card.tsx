import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon;
    iconClassName?: string;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    iconClassName = 'bg-primary/10 text-primary',
    description,
    trend,
    className,
}: StatCardProps) {
    return (
        <div
            className={cn(
                'bg-card rounded-lg border p-3 shadow-sm sm:p-4 lg:p-6',
                className
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <p className="text-muted-foreground text-xs font-medium sm:text-sm truncate">
                        {title}
                    </p>
                    <p className="text-2xl font-bold sm:text-3xl truncate">{value}</p>
                    {description && (
                        <p className="text-muted-foreground text-xs sm:text-sm mt-1 truncate">
                            {description}
                        </p>
                    )}
                    {trend && (
                        <p
                            className={cn(
                                'text-xs font-medium mt-1',
                                trend.isPositive ? 'text-green-600' : 'text-red-600'
                            )}
                        >
                            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={cn('rounded-full p-2 sm:p-3 flex-shrink-0', iconClassName)}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                )}
            </div>
        </div>
    );
}
