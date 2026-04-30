import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type InventoryItem, type MenuCategory, type MenuItem } from '@/types';

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
        available_quantity: menuItem?.available_quantity?.toString() || '0',
        low_stock_threshold: menuItem?.low_stock_threshold?.toString() || '5',
        is_available: menuItem?.is_available ?? true,
        is_featured: menuItem?.is_featured ?? false,
        allergens: (menuItem?.allergens || []).join(', '),
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(menuItem?.image_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [ingredients, setIngredients] = useState<IngredientRow[]>(
        menuItem?.ingredients?.map((i) => ({
            inventory_item_id: i.inventory_item_id,
            ingredient_name: i.ingredient_name,
            quantity_required: i.quantity_required,
            unit: i.unit,
        })) || [],
    );

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Menu', href: '/admin/menu' },
        { title: isEditing ? 'Edit Item' : 'New Item', href: '#' },
    ];

    const updateField = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

    const addIngredient = () =>
        setIngredients((prev) => [...prev, { inventory_item_id: null, ingredient_name: '', quantity_required: 0, unit: 'kg' }]);
    const removeIngredient = (idx: number) => setIngredients((prev) => prev.filter((_, i) => i !== idx));
    const updateIngredient = (idx: number, key: string, value: any) => {
        setIngredients((prev) => prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item)));
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('category_id', form.category_id);
        formData.append('description', form.description);
        formData.append('price', form.price);
        formData.append('available_quantity', form.available_quantity);
        formData.append('low_stock_threshold', form.low_stock_threshold);
        formData.append('is_available', form.is_available ? '1' : '0');
        formData.append('is_featured', form.is_featured ? '1' : '0');

        if (form.allergens) {
            form.allergens
                .split(',')
                .map((a) => a.trim())
                .filter(Boolean)
                .forEach((a, i) => {
                    formData.append(`allergens[${i}]`, a);
                });
        }

        ingredients
            .filter((i) => i.ingredient_name)
            .forEach((ing, i) => {
                if (ing.inventory_item_id) formData.append(`ingredients[${i}][inventory_item_id]`, String(ing.inventory_item_id));
                formData.append(`ingredients[${i}][ingredient_name]`, ing.ingredient_name);
                formData.append(`ingredients[${i}][quantity_required]`, String(ing.quantity_required));
                formData.append(`ingredients[${i}][unit]`, ing.unit);
            });

        if (imageFile) {
            formData.append('image', imageFile);
        }

        if (isEditing) {
            formData.append('_method', 'PUT');
            router.post(`/admin/menu/${menuItem!.id}`, formData, {
                forceFormData: true,
                onError: (errs) => {
                    setErrors(errs as Record<string, string>);
                    setProcessing(false);
                },
                onFinish: () => setProcessing(false),
            });
        } else {
            router.post('/admin/menu', formData, {
                forceFormData: true,
                onError: (errs) => {
                    setErrors(errs as Record<string, string>);
                    setProcessing(false);
                },
                onFinish: () => setProcessing(false),
            });
        }
    };

    const inputCls = 'w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? `Edit ${menuItem!.name}` : 'New Menu Item'} />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <a href="/admin/menu" className="hover:bg-accent rounded-md border p-2">
                        <ArrowLeft className="h-4 w-4" />
                    </a>
                    <h1 className="text-3xl font-bold tracking-tight">{isEditing ? 'Edit Menu Item' : 'New Menu Item'}</h1>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                        <div className="bg-card space-y-4 rounded-lg border p-6 shadow-sm">
                            <h2 className="text-xl font-semibold">Basic Info</h2>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Name *</label>
                                <input value={form.name} onChange={(e) => updateField('name', e.target.value)} className={inputCls} required />
                                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Category *</label>
                                <select
                                    value={form.category_id}
                                    onChange={(e) => updateField('category_id', e.target.value)}
                                    className={inputCls}
                                    required
                                >
                                    <option value="">Select category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    className={inputCls}
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Price (₱) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.price}
                                        onChange={(e) => updateField('price', e.target.value)}
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Stock Qty *</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.available_quantity}
                                        onChange={(e) => updateField('available_quantity', e.target.value)}
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Item Image</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    capture="environment"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                    id="menu-image-upload"
                                />
                                {imagePreview ? (
                                    <div className="relative mt-1 inline-block">
                                        <img src={imagePreview} alt="Preview" className="h-32 w-32 rounded-lg border object-cover" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white shadow hover:bg-red-600"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-1 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="text-muted-foreground hover:bg-accent flex items-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm"
                                        >
                                            <Upload className="h-4 w-4" /> Upload Photo
                                        </button>
                                    </div>
                                )}
                                {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image}</p>}
                                <p className="text-muted-foreground mt-1 text-xs">JPG, PNG, or WebP — max 5MB. On mobile, you can use your camera.</p>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Low Stock Threshold</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.low_stock_threshold}
                                    onChange={(e) => updateField('low_stock_threshold', e.target.value)}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Allergens</label>
                                <input
                                    value={form.allergens}
                                    onChange={(e) => updateField('allergens', e.target.value)}
                                    className={inputCls}
                                    placeholder="Shellfish, Gluten, Dairy"
                                />
                                <p className="text-muted-foreground mt-1 text-xs">Comma-separated</p>
                            </div>
                            <div className="flex gap-6">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.is_available}
                                        onChange={(e) => updateField('is_available', e.target.checked)}
                                        className="accent-primary"
                                    />
                                    <span className="text-sm">Available</span>
                                </label>
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.is_featured}
                                        onChange={(e) => updateField('is_featured', e.target.checked)}
                                        className="accent-primary"
                                    />
                                    <span className="text-sm">Featured</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-card rounded-lg border p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Ingredients</h2>
                                <button
                                    type="button"
                                    onClick={addIngredient}
                                    className="hover:bg-accent inline-flex items-center rounded-md border px-3 py-1 text-sm"
                                >
                                    <Plus className="mr-1 h-4 w-4" /> Add
                                </button>
                            </div>
                            {ingredients.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    No ingredients linked. Add ingredients to enable auto-deduction from inventory.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {ingredients.map((ing, idx) => (
                                        <div key={idx} className="flex items-start gap-2 rounded border p-3">
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    value={ing.ingredient_name}
                                                    onChange={(e) => updateIngredient(idx, 'ingredient_name', e.target.value)}
                                                    placeholder="Ingredient name"
                                                    className={inputCls}
                                                />
                                                <div className="grid grid-cols-3 gap-2">
                                                    <select
                                                        value={ing.inventory_item_id || ''}
                                                        onChange={(e) =>
                                                            updateIngredient(
                                                                idx,
                                                                'inventory_item_id',
                                                                e.target.value ? parseInt(e.target.value) : null,
                                                            )
                                                        }
                                                        className={inputCls}
                                                    >
                                                        <option value="">Link inventory</option>
                                                        {inventoryItems.map((inv) => (
                                                            <option key={inv.id} value={inv.id}>
                                                                {inv.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        min="0"
                                                        value={ing.quantity_required}
                                                        onChange={(e) => updateIngredient(idx, 'quantity_required', parseFloat(e.target.value))}
                                                        placeholder="Qty"
                                                        className={inputCls}
                                                    />
                                                    <select
                                                        value={ing.unit}
                                                        onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                                                        className={inputCls}
                                                    >
                                                        <option value="kg">kg</option>
                                                        <option value="g">g</option>
                                                        <option value="L">L</option>
                                                        <option value="mL">mL</option>
                                                        <option value="pcs">pcs</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeIngredient(idx)}
                                                className="mt-1 rounded p-1 hover:bg-red-50 dark:hover:bg-red-950"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md py-3 text-lg font-medium disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : isEditing ? 'Update Item' : 'Create Item'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
