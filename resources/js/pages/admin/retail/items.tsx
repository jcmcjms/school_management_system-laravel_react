import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Package, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData } from '@/types';

interface RetailItem {
    id: number;
    name: string;
    price: number;
    available_quantity: number;
    status: string;
    is_active: boolean;
    category: { id: number; name: string };
    vendor: { id: number; name: string } | null;
    vendor_commission: number;
    image_url: string | null;
}

interface Category {
    id: number;
    name: string;
}

interface Vendor {
    id: number;
    name: string;
}

interface Props {
    items: PaginatedData<RetailItem>;
    categories: Category[];
    vendors: Vendor[];
    filters: { search?: string; category_id?: string };
}

const formatPrice = (p: number | string) => Number(p).toFixed(2);
const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    limited: 'bg-yellow-100 text-yellow-800',
    out_of_stock: 'bg-red-100 text-red-800',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Retail Items', href: '/admin/retail/items' },
];

export default function RetailItems() {
    const { items, categories, filters } = usePage<Props>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [showStockModal, setShowStockModal] = useState(false);
    const [stockItem, setStockItem] = useState<RetailItem | null>(null);
    const [stockAdjustment, setStockAdjustment] = useState(0);

    const handleFilter = () => {
        router.get('/admin/retail/items', { search: search || undefined, category_id: categoryId || undefined }, { preserveState: true });
    };

    const openStockModal = (item: RetailItem) => {
        setStockItem(item);
        setStockAdjustment(0);
        setShowStockModal(true);
    };

    const handleStockSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!stockItem || stockAdjustment === 0) return;
        router.patch(`/admin/retail/items/${stockItem.id}/stock`, { adjustment: stockAdjustment }, { onFinish: () => setShowStockModal(false) });
    };

    const handleDelete = (item: RetailItem) => {
        if (confirm(`Delete "${item.name}"?`)) router.delete(`/admin/retail/items/${item.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Retail Items" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Retail Items</h1>
                        <p className="text-muted-foreground">Manage biscuits, candies, chocolates and other retail products</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/retail/categories" className="hover:bg-accent rounded-md border px-4 py-2 text-sm">
                            Categories
                        </Link>
                        <Link href="/admin/retail/vendors" className="hover:bg-accent rounded-md border px-4 py-2 text-sm">
                            Vendors
                        </Link>
                        <Link
                            href="/admin/retail/items/create"
                            className="bg-primary text-primary-foreground inline-flex items-center rounded-md px-4 py-2 text-sm"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Link>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            placeholder="Search items..."
                            className="w-full rounded-md border py-2 pr-3 pl-10"
                        />
                    </div>
                    <select
                        value={categoryId}
                        onChange={(e) => {
                            setCategoryId(e.target.value);
                            setTimeout(handleFilter, 0);
                        }}
                        className="rounded-md border px-3 py-2"
                    >
                        <option value="">All Categories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="bg-card rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Item</th>
                                <th className="px-4 py-3 text-left font-medium">Category</th>
                                <th className="px-4 py-3 text-left font-medium">Vendor</th>
                                <th className="px-4 py-3 text-right font-medium">Price</th>
                                <th className="px-4 py-3 text-right font-medium">Stock</th>
                                <th className="px-4 py-3 text-center font-medium">Status</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.data.map((item) => (
                                <tr key={item.id} className="hover:bg-muted/30 border-b">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {item.image_url && <img src={item.image_url} alt="" className="h-10 w-10 rounded object-cover" />}
                                            <span className="font-medium">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-muted-foreground px-4 py-3">{item.category?.name}</td>
                                    <td className="px-4 py-3">
                                        {item.vendor ? (
                                            <span className="text-sm">{item.vendor.name}</span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">Canteen-owned</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium">₱{formatPrice(item.price)}</td>
                                    <td className="px-4 py-3 text-right">{item.available_quantity}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[item.status] || ''}`}>
                                            {item.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => openStockModal(item)} className="hover:bg-accent rounded p-1" title="Adjust Stock">
                                                <Package className="h-4 w-4" />
                                            </button>
                                            <Link href={`/admin/retail/items/${item.id}/edit`} className="hover:bg-accent rounded p-1">
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                            <button onClick={() => handleDelete(item)} className="rounded p-1 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {items.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-muted-foreground px-4 py-8 text-center">
                                        No items found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {items.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: items.last_page }, (_, i) => i + 1).map((page) => (
                            <Link
                                key={page}
                                href={`/admin/retail/items?page=${page}&search=${search}&category_id=${categoryId}`}
                                className={`rounded-md px-3 py-1 text-sm ${page === items.current_page ? 'bg-primary text-primary-foreground' : 'border'}`}
                            >
                                {page}
                            </Link>
                        ))}
                    </div>
                )}

                {showStockModal && stockItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowStockModal(false)}>
                        <div className="bg-card w-full max-w-sm rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
                            <h2 className="mb-4 text-xl font-semibold">Adjust Stock</h2>
                            <p className="text-muted-foreground mb-4 text-sm">Current: {stockItem.available_quantity}</p>
                            <form onSubmit={handleStockSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Adjustment (+/-)</label>
                                    <input
                                        type="number"
                                        value={stockAdjustment}
                                        onChange={(e) => setStockAdjustment(parseInt(e.target.value) || 0)}
                                        className="w-full rounded-md border px-3 py-2"
                                    />
                                    <p className="mt-1 text-xs">New: {Math.max(0, stockItem.available_quantity + stockAdjustment)}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setShowStockModal(false)} className="flex-1 rounded-md border py-2">
                                        Cancel
                                    </button>
                                    <button type="submit" className="bg-primary text-primary-foreground flex-1 rounded-md py-2">
                                        Update
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
