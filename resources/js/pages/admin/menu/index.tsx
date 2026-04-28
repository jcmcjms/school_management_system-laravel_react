import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type MenuItem, type MenuCategory, type PaginatedData } from '@/types';

interface AdminMenuProps {
    menuItems: PaginatedData<MenuItem>;
    categories: MenuCategory[];
    filters: { search?: string; category_id?: string };
}

const formatPrice = (p: number | string) => Number(p).toFixed(2);
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Menu Management', href: '/admin/menu' }];

const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    limited: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    sold_out: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function AdminMenuIndex() {
    const { menuItems, categories, filters } = usePage<AdminMenuProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');

    const handleFilter = () => {
        router.get('/admin/menu', { search: search || undefined, category_id: categoryId || undefined }, { preserveState: true });
    };

    const handleDelete = (item: MenuItem) => {
        if (confirm(`Delete "${item.name}"?`)) {
            router.delete(`/admin/menu/${item.id}`);
        }
    };

    const handleToggle = (item: MenuItem) => {
        router.patch(`/admin/menu/${item.id}/toggle`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu Management" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
                        <p className="text-muted-foreground">Manage menu items and categories</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/categories" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">Categories</Link>
                        <Link href="/admin/menu/create" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            placeholder="Search items..." className="w-full rounded-md border bg-background py-2 pl-10 pr-3 text-sm" />
                    </div>
                    <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setTimeout(handleFilter, 0); }}
                        className="rounded-md border bg-background px-3 py-2 text-sm">
                        <option value="">All Categories</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Item</th>
                                <th className="px-4 py-3 text-left font-medium">Category</th>
                                <th className="px-4 py-3 text-right font-medium">Price</th>
                                <th className="px-4 py-3 text-right font-medium">Stock</th>
                                <th className="px-4 py-3 text-center font-medium">Status</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menuItems.data.map((item) => (
                                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {item.image_url && <img src={item.image_url} alt="" className="h-10 w-10 rounded object-cover" />}
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                {item.is_featured && <span className="text-xs text-primary">Featured</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{item.category?.name}</td>
                                    <td className="px-4 py-3 text-right font-medium">₱{formatPrice(item.price)}</td>
                                    <td className="px-4 py-3 text-right">{item.available_quantity}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[item.availability_status] || ''}`}>
                                            {item.availability_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleToggle(item)} className="rounded p-1 hover:bg-accent" title={item.is_available ? 'Hide' : 'Show'}>
                                                {item.is_available ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                                            </button>
                                            <Link href={`/admin/menu/${item.id}/edit`} className="rounded p-1 hover:bg-accent"><Edit className="h-4 w-4" /></Link>
                                            <button onClick={() => handleDelete(item)} className="rounded p-1 hover:bg-red-50 dark:hover:bg-red-950"><Trash2 className="h-4 w-4 text-red-500" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {menuItems.data.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No menu items found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {menuItems.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: menuItems.last_page }, (_, i) => i + 1).map((page) => (
                            <Link key={page} href={`/admin/menu?page=${page}&search=${search}&category_id=${categoryId}`}
                                className={`rounded-md px-3 py-1 text-sm ${page === menuItems.current_page ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'}`}>{page}</Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
