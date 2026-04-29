import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChefHat, ClipboardList, LayoutGrid, Package, Shield, ShoppingCart, Users, UtensilsCrossed, Wallet, Bell, MessageCircle, Grid3X3, CreditCard, DollarSign, BookOpen, Coins, FolderTree, BarChart3 } from 'lucide-react';
import AppLogo from './app-logo';

function getNavItems(role: string, permissions: string[]): NavItem[] {
    const has = (p: string) => permissions.includes(p);

    const items: NavItem[] = [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
    ];

    // Admin/management links based on permissions
    if (has('manage_menu')) {
        items.push({ title: 'Menu Management', url: '/admin/menu', icon: UtensilsCrossed });
        items.push({ title: 'Retail Items', url: '/admin/retail/items', icon: ShoppingCart });
        items.push({ title: 'Quick Sell', url: '/admin/retail/quick-sell', icon: Package });
        items.push({ title: 'Vendor Settlements', url: '/admin/retail/settlements', icon: DollarSign });
    }
    if (has('manage_categories')) {
        items.push({ title: 'Categories', url: '/admin/categories', icon: Grid3X3 });
    }
    if (has('manage_users')) {
        items.push({ title: 'Users', url: '/admin/users', icon: Users });
    }
    if (has('manage_inventory')) {
        items.push({ title: 'Inventory', url: '/admin/inventory', icon: Package });
    }
    if (has('view_revenue')) {
        items.push({ title: 'Revenue', url: '/admin/revenue', icon: Wallet });
    }
    if (has('manage_deduction_limits')) {
        items.push({ title: 'Salary Deductions', url: '/admin/salary-deductions', icon: CreditCard });
    }
    if (has('manage_roles')) {
        items.push({ title: 'Roles & Permissions', url: '/admin/roles', icon: Shield });
    }

    // Browse menu (everyone)
    if (has('browse_menu')) {
        items.push({ title: 'Browse Menu', url: '/menu', icon: ChefHat });
    }

    // Ordering links
    if (has('view_own_orders')) {
        items.push({ title: 'My Orders', url: '/orders', icon: ShoppingCart });
    }
    if (has('view_own_orders')) {
        items.push({ title: 'Reservations', url: '/reservations', icon: ClipboardList });
    }

    // Chat & Notifications (everyone)
    items.push({ title: 'Chat', url: '/chat', icon: MessageCircle });
    items.push({ title: 'Notifications', url: '/notifications', icon: Bell });

    // Library module
    if (has('manage_library') || role === 'librarian') {
        items.push({ title: 'Library', url: '/library', icon: BookOpen });
        items.push({ title: 'Library Books', url: '/library/books', icon: BookOpen });
        items.push({ title: 'Borrowings', url: '/library/borrowings', icon: ClipboardList });
        items.push({ title: 'Fines', url: '/library/fines', icon: Coins });
        items.push({ title: 'Categories', url: '/library/categories', icon: FolderTree });
        items.push({ title: 'Reports', url: '/library/reports', icon: BarChart3 });
    } else if (has('view_library') || role === 'student' || role === 'faculty') {
        items.push({ title: 'Library', url: '/library', icon: BookOpen });
    }

    return items;
}

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const role = (auth?.user as any)?.role || 'student';
    const permissions: string[] = (auth as any)?.permissions || [];
    const navItems = getNavItems(role, permissions);

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

