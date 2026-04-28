import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type MenuItem, type MenuCategory, type InventoryItem } from '@/types';

interface MenuFormProps {
    menuItem?: MenuItem;
    categories: MenuCategory[];
    inventoryItems: InventoryItem[];
}

interface IngredientRow {
    inventory_item_id: number | null;
    ingredient_name: string;
    quantity_required: number;
    unit: string;
}

export default function AdminMenuForm() {
    const { menuItem, categories, inventoryItems } = usePage<MenuFormProps>().props;
    const isEditing = !!menuItem;

    const [form, setForm] = useState({
        name: menuItem?.name || '',
        category_id: menuItem?.category_id?.toString() || '',
        description: menuItem?.description || '',
        price: menuItem?.price?.toString() || '',
        image_url: menuItem?.image_url || '',
        available_quantity: menuItem?.available_quantity?.toString() || '0',
        low_stock_threshold: menuItem?.low_stock_threshold?.toString() || '5',
        is_available: menuItem?.is_available ?? true,
        is_featured: menuItem?.is_featured ?? false,
        allergens: (menuItem?.allergens || []).join(', '),
    });

    const [ingredients, setIngredients] = useState<IngredientRow[]>(
        menuItem?.ingredients?.map((i) => ({
            inventory_item_id: i.inventory_item_id,
            ingredient_name: i.ingredient_name,
            quantity_required: i.quantity_required,
            unit: i.unit,
        })) || []
    );

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Menu', href: '/admin/menu' },
        { title: isEditing ? 'Edit Item' : 'New Item', href: '#' },
    ];

    const updateField = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

    const addIngredient = () => setIngredients((prev) => [...prev, { inventory_item_id: null, ingredient_name: '', quantity_required: 0, unit: 'kg' }]);
    const removeIngredient = (idx: number) => setIngredients((prev) => prev.filter((_, i) => i !== idx));
    const updateIngredient = (idx: number, key: string, value: any) => {
        setIngredients((prev) => prev.map((item, i) => i === idx ? { ...item, [key]: value } : item));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const data = {
            ...form,
            category_id: parseInt(form.category_id),
            price: parseFloat(form.price),
            available_quantity: parseInt(form.available_quantity),
            low_stock_threshold: parseInt(form.low_stock_threshold),
            allergens: form.allergens ? form.allergens.split(',').map((a) => a.trim()).filter(Boolean) : [],
            ingredients: ingredients.filter((i) => i.ingredient_name),
        };

        const url = isEditing ? `/admin/menu/${menuItem!.id}` : '/admin/menu';
        const method = isEditing ? 'put' : 'post';

        router[method](url, data as any, {
            onError: (errs) => { setErrors(errs as Record<string, string>); setProcessing(false); },
            onFinish: () => setProcessing(false),
        });
    };

    const inputCls = "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? `Edit ${menuItem!.name}` : 'New Menu Item'} />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <a href="/admin/menu" className="rounded-md border p-2 hover:bg-accent"><ArrowLeft className="h-4 w-4" /></a>
                    <h1 className="text-3xl font-bold tracking-tight">{isEditing ? 'Edit Menu Item' : 'New Menu Item'}</h1>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                        <div className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
                            <h2 className="text-xl font-semibold">Basic Info</h2>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Name *</label>
                                <input value={form.name} onChange={(e) => updateField('name', e.target.value)} className={inputCls} required />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Category *</label>
                                <select value={form.category_id} onChange={(e) => updateField('category_id', e.target.value)} className={inputCls} required>
                                    <option value="">Select category</option>
                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Description</label>
                                <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} className={inputCls} rows={3} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Price (₱) *</label>
                                    <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => updateField('price', e.target.value)} className={inputCls} required />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Image URL</label>
                                    <input value={form.image_url} onChange={(e) => updateField('image_url', e.target.value)} className={inputCls} placeholder="https://..." />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Stock Qty *</label>
                                    <input type="number" min="0" value={form.available_quantity} onChange={(e) => updateField('available_quantity', e.target.value)} className={inputCls} />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Low Stock Threshold</label>
                                    <input type="number" min="0" value={form.low_stock_threshold} onChange={(e) => updateField('low_stock_threshold', e.target.value)} className={inputCls} />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Allergens</label>
                                <input value={form.allergens} onChange={(e) => updateField('allergens', e.target.value)} className={inputCls} placeholder="Shellfish, Gluten, Dairy" />
                                <p className="mt-1 text-xs text-muted-foreground">Comma-separated</p>
                            </div>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.is_available} onChange={(e) => updateField('is_available', e.target.checked)} className="accent-primary" />
                                    <span className="text-sm">Available</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.is_featured} onChange={(e) => updateField('is_featured', e.target.checked)} className="accent-primary" />
                                    <span className="text-sm">Featured</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Ingredients</h2>
                                <button type="button" onClick={addIngredient} className="inline-flex items-center rounded-md border px-3 py-1 text-sm hover:bg-accent">
                                    <Plus className="mr-1 h-4 w-4" /> Add
                                </button>
                            </div>
                            {ingredients.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No ingredients linked. Add ingredients to enable auto-deduction from inventory.</p>
                            ) : (
                                <div className="space-y-3">
                                    {ingredients.map((ing, idx) => (
                                        <div key={idx} className="flex gap-2 items-start rounded border p-3">
                                            <div className="flex-1 space-y-2">
                                                <input value={ing.ingredient_name} onChange={(e) => updateIngredient(idx, 'ingredient_name', e.target.value)}
                                                    placeholder="Ingredient name" className={inputCls} />
                                                <div className="grid grid-cols-3 gap-2">
                                                    <select value={ing.inventory_item_id || ''} onChange={(e) => updateIngredient(idx, 'inventory_item_id', e.target.value ? parseInt(e.target.value) : null)} className={inputCls}>
                                                        <option value="">Link inventory</option>
                                                        {inventoryItems.map((inv) => <option key={inv.id} value={inv.id}>{inv.name}</option>)}
                                                    </select>
                                                    <input type="number" step="0.001" min="0" value={ing.quantity_required} onChange={(e) => updateIngredient(idx, 'quantity_required', parseFloat(e.target.value))}
                                                        placeholder="Qty" className={inputCls} />
                                                    <select value={ing.unit} onChange={(e) => updateIngredient(idx, 'unit', e.target.value)} className={inputCls}>
                                                        <option value="kg">kg</option><option value="g">g</option><option value="L">L</option>
                                                        <option value="mL">mL</option><option value="pcs">pcs</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => removeIngredient(idx)} className="rounded p-1 hover:bg-red-50 dark:hover:bg-red-950 mt-1">
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={processing}
                            className="w-full rounded-md bg-primary py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                            {processing ? 'Saving...' : isEditing ? 'Update Item' : 'Create Item'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
