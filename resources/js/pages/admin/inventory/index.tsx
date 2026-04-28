import { Head, router, usePage } from '@inertiajs/react';
import { AlertTriangle, Package, Plus, Search } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type InventoryItem, type PaginatedData, type Supplier } from '@/types';

interface InventoryAlert { id: number; alert_type: string; status: string; inventory_item?: InventoryItem }

interface AdminInventoryProps {
    inventoryItems: PaginatedData<InventoryItem>;
    categories: string[];
    alerts: InventoryAlert[];
    suppliers: Supplier[];
    filters: { search?: string; category?: string; low_stock?: string };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Inventory', href: '/admin/inventory' }];

const emptyItem = { name: '', sku: '', category: '', current_quantity: '0', minimum_quantity: '0', unit: 'kg', unit_cost: '', supplier_id: '', low_stock_alert: true };

export default function AdminInventoryIndex() {
    const { inventoryItems, categories, alerts, suppliers, filters } = usePage<AdminInventoryProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [form, setForm] = useState<any>(emptyItem);
    const [stockForm, setStockForm] = useState<{ itemId: number | null; quantity: string; notes: string }>({ itemId: null, quantity: '', notes: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleFilter = () => router.get('/admin/inventory', { search: search || undefined, category: category || undefined, low_stock: filters.low_stock }, { preserveState: true });

    const openCreate = () => { setForm(emptyItem); setEditingItem(null); setShowForm(true); setErrors({}); };
    const openEdit = (item: InventoryItem) => {
        setForm({ name: item.name, sku: item.sku, category: item.category, minimum_quantity: item.minimum_quantity.toString(), unit: item.unit, unit_cost: item.unit_cost?.toString() || '', supplier_id: item.supplier_id?.toString() || '', low_stock_alert: item.low_stock_alert, is_active: item.is_active });
        setEditingItem(item); setShowForm(true); setErrors({});
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = { ...form, current_quantity: parseFloat(form.current_quantity) || 0, minimum_quantity: parseFloat(form.minimum_quantity) || 0, unit_cost: form.unit_cost ? parseFloat(form.unit_cost) : null, supplier_id: form.supplier_id ? parseInt(form.supplier_id) : null };
        const opts = { onError: (errs: any) => setErrors(errs), onSuccess: () => setShowForm(false) };
        editingItem ? router.put(`/admin/inventory/${editingItem.id}`, data, opts) : router.post('/admin/inventory', data, opts);
    };

    const handleAddStock = (e: React.FormEvent) => {
        e.preventDefault();
        if (!stockForm.itemId) return;
        router.post(`/admin/inventory/${stockForm.itemId}/add-stock`, { quantity: parseFloat(stockForm.quantity), notes: stockForm.notes }, { onSuccess: () => setStockForm({ itemId: null, quantity: '', notes: '' }) });
    };

    const inputCls = "w-full rounded-md border bg-background px-3 py-2 text-sm";

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory Management" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div><h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1><p className="text-muted-foreground">Manage raw materials and stock levels</p></div>
                    <button onClick={openCreate} className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Plus className="mr-2 h-4 w-4" /> Add Item</button>
                </div>

                {/* Alerts */}
                {alerts.length > 0 && (
                    <div className="rounded-lg border border-red-500 bg-red-50 p-4 dark:bg-red-950">
                        <h3 className="flex items-center gap-2 font-semibold text-red-700"><AlertTriangle className="h-5 w-5" /> Active Alerts ({alerts.length})</h3>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {alerts.map((alert) => (
                                <div key={alert.id} className="flex items-center justify-between rounded border border-red-300 bg-white p-2 dark:bg-red-900">
                                    <span className="text-sm">{alert.inventory_item?.name} — {alert.alert_type.replace('_', ' ')}</span>
                                    <button onClick={() => router.patch(`/admin/inventory/alerts/${alert.id}/acknowledge`)} className="rounded px-2 py-0.5 text-xs border hover:bg-accent">Acknowledge</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleFilter()} placeholder="Search..." className="w-full rounded-md border bg-background py-2 pl-10 pr-3 text-sm" />
                    </div>
                    <select value={category} onChange={(e) => { setCategory(e.target.value); setTimeout(handleFilter, 0); }} className="rounded-md border bg-background px-3 py-2 text-sm">
                        <option value="">All Categories</option>
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Item</th>
                                <th className="px-4 py-3 text-left font-medium">SKU</th>
                                <th className="px-4 py-3 text-left font-medium">Category</th>
                                <th className="px-4 py-3 text-right font-medium">Stock</th>
                                <th className="px-4 py-3 text-right font-medium">Min</th>
                                <th className="px-4 py-3 text-center font-medium">Status</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryItems.data.map((item) => {
                                const isLow = Number(item.current_quantity) <= Number(item.minimum_quantity);
                                const isOut = Number(item.current_quantity) <= 0;
                                return (
                                    <tr key={item.id} className={`border-b last:border-0 ${isOut ? 'bg-red-50 dark:bg-red-950/30' : isLow ? 'bg-yellow-50 dark:bg-yellow-950/30' : 'hover:bg-muted/30'}`}>
                                        <td className="px-4 py-3 font-medium">{item.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{item.sku}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                                        <td className="px-4 py-3 text-right font-medium">{item.current_quantity} {item.unit}</td>
                                        <td className="px-4 py-3 text-right text-muted-foreground">{item.minimum_quantity} {item.unit}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${isOut ? 'bg-red-100 text-red-800' : isLow ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                {isOut ? 'Out' : isLow ? 'Low' : 'OK'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => setStockForm({ itemId: item.id, quantity: '', notes: '' })} className="rounded px-2 py-1 text-xs border hover:bg-accent mr-1">+ Stock</button>
                                            <button onClick={() => openEdit(item)} className="rounded p-1 hover:bg-accent"><Package className="h-4 w-4" /></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Stock Modal */}
            {stockForm.itemId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setStockForm({ itemId: null, quantity: '', notes: '' })}>
                    <div className="w-full max-w-sm rounded-lg bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-4 text-xl font-semibold">Add Stock</h2>
                        <form onSubmit={handleAddStock} className="space-y-3">
                            <div><label className="mb-1 block text-sm font-medium">Quantity</label><input type="number" step="0.001" min="0.001" value={stockForm.quantity} onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })} className={inputCls} required /></div>
                            <div><label className="mb-1 block text-sm font-medium">Notes</label><input value={stockForm.notes} onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })} className={inputCls} placeholder="Delivery note..." /></div>
                            <div className="flex gap-2"><button type="button" onClick={() => setStockForm({ itemId: null, quantity: '', notes: '' })} className="flex-1 rounded-md border py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Add</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create/Edit Item Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
                    <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-4 text-xl font-semibold">{editingItem ? 'Edit Item' : 'New Inventory Item'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="mb-1 block text-xs font-medium">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} required /></div>
                                <div><label className="mb-1 block text-xs font-medium">SKU *</label><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={inputCls} required disabled={!!editingItem} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="mb-1 block text-xs font-medium">Category *</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls} required list="inv-cats" /><datalist id="inv-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist></div>
                                <div><label className="mb-1 block text-xs font-medium">Unit *</label>
                                    <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={inputCls}><option value="kg">kg</option><option value="g">g</option><option value="L">L</option><option value="mL">mL</option><option value="pcs">pcs</option></select>
                                </div>
                            </div>
                            {!editingItem && <div><label className="mb-1 block text-xs font-medium">Initial Quantity</label><input type="number" step="0.001" min="0" value={form.current_quantity} onChange={(e) => setForm({ ...form, current_quantity: e.target.value })} className={inputCls} /></div>}
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="mb-1 block text-xs font-medium">Min Quantity</label><input type="number" step="0.001" min="0" value={form.minimum_quantity} onChange={(e) => setForm({ ...form, minimum_quantity: e.target.value })} className={inputCls} /></div>
                                <div><label className="mb-1 block text-xs font-medium">Unit Cost (₱)</label><input type="number" step="0.01" min="0" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} className={inputCls} /></div>
                            </div>
                            <div><label className="mb-1 block text-xs font-medium">Supplier</label>
                                <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} className={inputCls}><option value="">None</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                            </div>
                            {Object.values(errors).length > 0 && <div className="rounded bg-red-50 p-2 text-sm text-red-600 dark:bg-red-950">{Object.values(errors).map((e, i) => <p key={i}>{e}</p>)}</div>}
                            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-md border py-2 text-sm hover:bg-accent">Cancel</button><button type="submit" className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{editingItem ? 'Update' : 'Create'}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
