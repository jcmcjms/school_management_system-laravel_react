import { useState, useEffect } from 'react';
import { Clock, Coffee, Utensils, Sun, Sunset, Moon } from 'lucide-react';

interface MealPeriod {
    name: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}

const MEAL_SCHEDULE: { start: number; end: number; period: MealPeriod }[] = [
    {
        start: 6 * 60,       // 6:00 AM
        end: 8 * 60,         // 8:00 AM
        period: { name: 'Breakfast', icon: <Coffee className="h-4 w-4" />, color: 'text-amber-700 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800' },
    },
    {
        start: 9 * 60 + 30,  // 9:30 AM
        end: 10 * 60,        // 10:00 AM
        period: { name: 'Morning Recess', icon: <Sun className="h-4 w-4" />, color: 'text-orange-700 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/40 border-orange-200 dark:border-orange-800' },
    },
    {
        start: 11 * 60 + 30, // 11:30 AM
        end: 13 * 60,        // 1:00 PM
        period: { name: 'Lunch', icon: <Utensils className="h-4 w-4" />, color: 'text-green-700 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/40 border-green-200 dark:border-green-800' },
    },
    {
        start: 14 * 60 + 30, // 2:30 PM
        end: 15 * 60,        // 3:00 PM
        period: { name: 'Afternoon Recess', icon: <Sunset className="h-4 w-4" />, color: 'text-purple-700 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800' },
    },
    {
        start: 17 * 60,      // 5:00 PM
        end: 19 * 60,        // 7:00 PM
        period: { name: 'Dinner', icon: <Moon className="h-4 w-4" />, color: 'text-indigo-700 dark:text-indigo-400', bgColor: 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-800' },
    },
];

function getCurrentMealPeriod(now: Date): MealPeriod | null {
    const minutes = now.getHours() * 60 + now.getMinutes();
    for (const slot of MEAL_SCHEDULE) {
        if (minutes >= slot.start && minutes < slot.end) {
            return slot.period;
        }
    }
    return null;
}

function getNextMealPeriod(now: Date): { period: MealPeriod; startsIn: string } | null {
    const minutes = now.getHours() * 60 + now.getMinutes();
    for (const slot of MEAL_SCHEDULE) {
        if (minutes < slot.start) {
            const diff = slot.start - minutes;
            const h = Math.floor(diff / 60);
            const m = diff % 60;
            const startsIn = h > 0 ? `${h}h ${m}m` : `${m}m`;
            return { period: slot.period, startsIn };
        }
    }
    return null;
}

export function LiveClock() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const currentPeriod = getCurrentMealPeriod(now);
    const nextPeriod = !currentPeriod ? getNextMealPeriod(now) : null;

    return (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4 shadow-sm">
            {/* Clock */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <p className="text-2xl font-bold tabular-nums tracking-tight">{timeStr}</p>
                    <p className="text-sm text-muted-foreground">{dateStr}</p>
                </div>
            </div>

            {/* Divider */}
            <div className="hidden h-12 w-px bg-border sm:block" />

            {/* Meal Period */}
            <div className="flex items-center gap-2">
                {currentPeriod ? (
                    <div className={`flex items-center gap-2 rounded-full border px-4 py-2 ${currentPeriod.bgColor}`}>
                        <span className={currentPeriod.color}>{currentPeriod.icon}</span>
                        <div>
                            <p className={`text-sm font-semibold ${currentPeriod.color}`}>{currentPeriod.name}</p>
                            <p className={`text-xs ${currentPeriod.color} opacity-75`}>Now serving</p>
                        </div>
                        <span className="relative ml-1 flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                        </span>
                    </div>
                ) : nextPeriod ? (
                    <div className="flex items-center gap-2 rounded-full border border-border px-4 py-2">
                        <span className="text-muted-foreground">{nextPeriod.period.icon}</span>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Next: {nextPeriod.period.name}</p>
                            <p className="text-xs text-muted-foreground/70">Starts in {nextPeriod.startsIn}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 rounded-full border border-border px-4 py-2">
                        <Moon className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">Canteen closed</p>
                    </div>
                )}
            </div>
        </div>
    );
}
