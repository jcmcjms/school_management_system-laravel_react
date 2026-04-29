import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2, ToggleLeft, ToggleRight, Package, Download, Upload } from 'lucide-react';
import { useState, useRef } from 'react';

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
    hidden: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const statusLabels: Record<string, string> = {
    available: 'Available',
    limited: 'Limited',
    sold_out: 'Sold Out',
    hidden: 'Hidden',
};

export default function AdminMenuIndex() {
    const { menuItems, categories, filters } = usePage<AdminMenuProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [showStockModal, setShowStockModal] = useState(false);
    const [stockItem, setStockItem] = useState<MenuItem | null>(null);
    const [stockAdjustment, setStockAdjustment] = useState(0);
    const [stockNote, setStockNote] = useState('');
    const [adjustingStock, setAdjustingStock] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openStockModal = (item: MenuItem) => {
        setStockItem(item);
        setStockAdjustment(0);
        setStockNote('');
        setShowStockModal(true);
    };

    const handleStockAdjustment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!stockItem || stockAdjustment === 0) return;

        setAdjustingStock(true);
        const newQuantity = stockItem.available_quantity + stockAdjustment;

        router.patch(`/admin/menu/${stockItem.id}`, {
            available_quantity: Math.max(0, newQuantity),
        }, {
            onFinish: () => {
                setAdjustingStock(false);
                setShowStockModal(false);
            },
        });
    };

    const handleExport = () => {
        window.location.href = '/admin/menu/export';
    };

    const handleImportClick = () => {
        setShowImportModal(true);
    };

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImportFile(file);
        }
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!importFile) return;

        setImporting(true);
        const formData = new FormData();
        formData.append('file', importFile);

        router.post('/admin/menu/import', formData, {
            forceFormData: true,
            onFinish: () => {
                setImporting(false);
                setShowImportModal(false);
                setImportFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    const handleFilter = () => {
        router.get('/admin/menu', { search: search || undefined, category_id: categoryId || undefined }, { preserveState: true });
    };

    const handleDelete = (item: MenuItem) => {
        if (confirm(`Delete "${item.name ?? 'Untitled'}"?`)) {
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
                        <button onClick={handleExport} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
                            <Download className="mr-2 h-4 w-4 inline" /> Export
                        </button>
                        <button onClick={handleImportClick} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
                            <Upload className="mr-2 h-4 w-4 inline" /> Import
                        </button>
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
                                                <p className="font-medium">{item.name ?? 'Untitled'}</p>
                                                {item.is_featured && <span className="text-xs text-primary">Featured</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{item.category?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-right font-medium">₱{formatPrice(item.price)}</td>
                                    <td className="px-4 py-3 text-right">{item.available_quantity}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[item.availability_status] || ''}`}>
                                            {statusLabels[item.availability_status] || item.availability_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openStockModal(item)} className="rounded p-1 hover:bg-accent" title="Adjust Stock">
                                                <Package className="h-4 w-4" />
                                            </button>
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

                {/* Stock Adjustment Modal */}
                {showStockModal && stockItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowStockModal(false)}>
                        <div className="w-full max-w-sm rounded-lg bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <h2 className="mb-4 text-xl font-semibold">Adjust Stock</h2>
                            <p className="mb-4 text-sm text-muted-foreground">
                                <span className="font-medium">{stockItem.name}</span>
                                <br />
                                Current stock: <span className="font-medium">{stockItem.available_quantity}</span>
                            </p>
                            <form onSubmit={handleStockAdjustment} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Adjustment (+/-)</label>
                                    <input
                                        type="number"
                                        value={stockAdjustment}
                                        onChange={(e) => setStockAdjustment(parseInt(e.target.value) || 0)}
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                        placeholder="e.g. 10 or -5"
                                    />
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        New stock: {Math.max(0, stockItem.available_quantity + stockAdjustment)}
                                    </p>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Note (optional)</label>
                                    <input
                                        value={stockNote}
                                        onChange={(e) => setStockNote(e.target.value)}
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                        placeholder="Reason for adjustment"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setShowStockModal(false)}
                                        className="flex-1 rounded-md border py-2 text-sm hover:bg-accent">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={adjustingStock || stockAdjustment === 0}
                                        className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                                        {adjustingStock ? 'Saving...' : 'Update Stock'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Import Modal */}
                {showImportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowImportModal(false)}>
                        <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <h2 className="mb-4 text-xl font-semibold">Import Menu Items</h2>
                            <div className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                <p className="font-medium">CSV Format:</p>
                                <p className="mt-1">Name, Category, Price, Stock, Low Stock Threshold, Status, Available, Description, Allergens</p>
                                <p className="mt-2 text-xs">The first row should be headers. "Available" should be Yes/No.</p>
                            </div>
                            <form onSubmit={handleImportSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Select CSV File</label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv"
                                        onChange={handleImportFile}
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                                    />
                                    {importFile && (
                                        <p className="mt-1 text-sm text-green-600">Selected: {importFile.name}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setShowImportModal(false)}
                                        className="flex-1 rounded-md border py-2 text-sm hover:bg-accent">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={importing || !importFile}
                                        className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                                        {importing ? 'Importing...' : 'Import'}
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
