import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, ChefHat, ClipboardList, Folder, LayoutGrid, Package, ShoppingCart, Users, Wallet, UtensilsCrossed } from 'lucide-react';
import AppLogo from './app-logo';

function getNavItems(role: string): NavItem[] {
    const common: NavItem[] = [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
    ];

    switch (role) {
        case 'admin':
        case 'manager':
            return [
                ...common,
                { title: 'Menu Management', url: '/admin/menu', icon: UtensilsCrossed },
                { title: 'Users', url: '/admin/users', icon: Users },
                { title: 'Inventory', url: '/admin/inventory', icon: Package },
                { title: 'Revenue', url: '/admin/revenue', icon: Wallet },
                { title: 'Browse Menu', url: '/menu', icon: ChefHat },
            ];
        case 'staff':
            return [
                ...common,
                { title: 'Browse Menu', url: '/menu', icon: ChefHat },
            ];
        case 'faculty':
            return [
                ...common,
                { title: 'Browse Menu', url: '/menu', icon: ChefHat },
                { title: 'My Orders', url: '/orders', icon: ShoppingCart },
                { title: 'Reservations', url: '/reservations', icon: ClipboardList },
            ];
        case 'student':
        case 'parent':
            return [
                ...common,
                { title: 'Browse Menu', url: '/menu', icon: ChefHat },
                { title: 'My Orders', url: '/orders', icon: ShoppingCart },
                { title: 'Reservations', url: '/reservations', icon: ClipboardList },
            ];
        default:
            return common;
    }
}

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const role = (auth?.user as any)?.role || 'student';
    const navItems = getNavItems(role);

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
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
