import { useState } from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup } from '@/components/ui/sidebar';
import { type NavGroup, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight, LayoutGrid, BookOpen, UtensilsCrossed, Wallet, Package, Users, Shield, ClipboardList, ShoppingCart, CreditCard, MessageCircle, Bell, DollarSign, Grid3X3, ShoppingBag, UsersRound, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppLogo from './app-logo';
import { UserInfo } from '@/components/user-info';
import { ChevronsUpDown } from 'lucide-react';

function getNavGroups(role: string, permissions: string[]): NavGroup[] {
    const has = (p: string) => permissions.includes(p);
    const isAdmin = role === 'admin';
    const isLibrarian = role === 'librarian' || has('manage_library');
    const isManager = role === 'manager' || has('manage_menu');

    const groups: NavGroup[] = [];

    // If librarian, show Library Dashboard, otherwise show main Dashboard
    if (isLibrarian) {
        groups.push({
            title: 'Overview',
            items: [
                { title: 'Dashboard', url: '/library', icon: BookOpen },
            ],
        });
    } else {
        groups.push({
            title: 'Overview',
            items: [
                { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
            ],
        });
    }

    // Canteen / Food Service
    if (has('browse_menu') || isManager || isAdmin) {
        const canteenItems = [
            { title: 'Browse Menu', url: '/menu', icon: ShoppingBag },
        ];
        if (has('view_own_orders')) {
            canteenItems.push({ title: 'My Orders', url: '/orders', icon: ShoppingCart });
            canteenItems.push({ title: 'Reservations', url: '/reservations', icon: ClipboardList });
        }
        if (has('manage_menu')) {
            canteenItems.push({ title: 'Menu Management', url: '/admin/menu', icon: UtensilsCrossed });
            canteenItems.push({ title: 'Retail Items', url: '/admin/retail/items', icon: Package });
            canteenItems.push({ title: 'Quick Sell', url: '/admin/retail/quick-sell', icon: Package });
            canteenItems.push({ title: 'Settlements', url: '/admin/retail/settlements', icon: DollarSign });
        }
        if (has('manage_categories')) {
            canteenItems.push({ title: 'Categories', url: '/admin/categories', icon: Grid3X3 });
        }
        groups.push({ title: 'Canteen', items: canteenItems });
    }

    // Library
    if (has('view_library') || isLibrarian) {
        const libraryItems = [];
        
        // Librarians get full access (no Dashboard - already in Overview)
        if (isLibrarian) {
            libraryItems.push({ title: 'Books', url: '/library/books', icon: BookOpen });
            libraryItems.push({ title: 'Borrowings', url: '/library/borrowings', icon: ClipboardList });
            libraryItems.push({ title: 'Fines', url: '/library/fines', icon: DollarSign });
            libraryItems.push({ title: 'Categories', url: '/library/categories', icon: Grid3X3 });
            libraryItems.push({ title: 'Reports', url: '/library/reports', icon: BarChart3 });
        } else {
            // Regular users just see library
            libraryItems.push({ title: 'Library', url: '/library', icon: BookOpen });
        }
        
        if (libraryItems.length > 0) {
            groups.push({ title: 'Library', items: libraryItems });
        }
    }

    // Admin & Management
    if (isAdmin || has('manage_inventory') || has('manage_users') || has('view_revenue') || has('manage_deduction_limits')) {
        const adminItems: typeof groups[0]['items'] = [];
        if (has('manage_users')) {
            adminItems.push({ title: 'Users', url: '/admin/users', icon: UsersRound });
        }
        if (has('manage_inventory')) {
            adminItems.push({ title: 'Inventory', url: '/admin/inventory', icon: Package });
        }
        if (has('view_revenue')) {
            adminItems.push({ title: 'Revenue', url: '/admin/revenue', icon: Wallet });
        }
        if (has('manage_deduction_limits')) {
            adminItems.push({ title: 'Salary Deductions', url: '/admin/salary-deductions', icon: CreditCard });
        }
        if (isAdmin) {
            adminItems.push({ title: 'Roles & Permissions', url: '/admin/roles', icon: Shield });
        }
        if (adminItems.length > 0) {
            groups.push({ title: 'Administration', items: adminItems });
        }
    }

    // Communication
    groups.push({
        title: 'Communication',
        items: [
            { title: 'Chat', url: '/chat', icon: MessageCircle },
            { title: 'Notifications', url: '/notifications', icon: Bell },
        ],
    });

    return groups;
}

function NavGroupAccordion({ group, defaultOpen }: { group: NavGroup; defaultOpen?: boolean }) {
    const page = usePage();
    const url = page.url;
    
    // Check if any item URL matches the current page URL
    const hasActiveItem = group.items.some(item => url === item.url || url.startsWith(item.url + '/'));
    
    // Always call useState - initialize based on whether there's an active item
    const [isOpen, setIsOpen] = useState(() => {
        if (hasActiveItem) return true;
        return defaultOpen ?? true;
    });

    return (
        <SidebarGroup>
            <SidebarMenuButton
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "mb-1 hover:bg-sidebar-accent cursor-pointer",
                    hasActiveItem && "bg-sidebar-accent"
                )}
            >
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span className="font-semibold text-xs uppercase tracking-wider text-sidebar-foreground/70">
                    {group.title}
                </span>
            </SidebarMenuButton>
            {isOpen && (
                <SidebarMenu>
                    {group.items.map((item) => {
                        const isActive = url === item.url || url.startsWith(item.url + '/');
                        return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={isActive}>
                                <Link href={item.url} prefetch>
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            )}
        </SidebarGroup>
    );
}

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const role = (auth?.user as any)?.role || 'student';
    const permissions: string[] = (auth as any)?.permissions || [];
    const navGroups = getNavGroups(role, permissions);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {navGroups.map((group, index) => (
                    <NavGroupAccordion 
                        key={group.title} 
                        group={group} 
                        defaultOpen={index < 2}
                    />
                ))}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group"
                        >
                            <UserInfo user={auth.user} />
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}