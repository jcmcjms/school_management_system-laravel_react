import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';
import { useState, useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'SMS';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        const [isLoading, setIsLoading] = useState(true);

        useEffect(() => {
            // Check if this is a first-time visit (no session storage marker)
            if (!sessionStorage.getItem('smsAppLoaded')) {
                // Simulate loading for visual effect on first visit
                const timer = setTimeout(() => {
                    setIsLoading(false);
                    sessionStorage.setItem('smsAppLoaded', 'true');
                }, 1500);
                return () => clearTimeout(timer);
            } else {
                setIsLoading(false);
            }
        }, []);

        root.render(
            <>
                {isLoading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
                        <div className="flex flex-col items-center gap-4">
                            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                            <p className="text-sm font-medium text-muted-foreground">Loading SMS...</p>
                        </div>
                    </div>
                )}
                <App {...props} />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
