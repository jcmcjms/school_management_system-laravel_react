import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Category {
    id: number;
    name: string;
}

interface Vendor {
    id: number;
    name: string;
}

interface Item {
    id: number;
    name: string;
    description: string | null;
    price: number;
    available_quantity: number;
    low_stock_threshold: number;
    is_active: boolean;
    vendor_id: number | null;
    vendor_commission: number;
    image_url: string | null;
    retail_category_id: number;
}

interface Props {
    item?: Item;
    categories: Category[];
    vendors: Vendor[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Retail Items', href: '/admin/retail/items' },
    { title: 'Add Item', href: '/admin/retail/items/create' },
];

export default function RetailItemForm() {
    const { item, categories, vendors } = usePage<Props>().props;
    const isEditing = !!item;
    const [form, setForm] = useState({
        name: item?.name || '',
        retail_category_id: item?.retail_category_id?.toString() || '',
        vendor_id: item?.vendor_id?.toString() || '',
        description: item?.description || '',
        price: item?.price?.toString() || '',
        available_quantity: item?.available_quantity?.toString() || '0',
        low_stock_threshold: item?.low_stock_threshold?.toString() || '10',
        vendor_commission: item?.vendor_commission?.toString() || '70',
        is_active: item?.is_active ?? true,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState(item?.image_url || null);
    const [processing, setProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        formData.append('retail_category_id', form.retail_category_id);
        if (form.vendor_id) formData.append('vendor_id', form.vendor_id);
        formData.append('description', form.description);
        formData.append('price', form.price);
        formData.append('available_quantity', form.available_quantity);
        formData.append('low_stock_threshold', form.low_stock_threshold);
        if (form.vendor_id) formData.append('vendor_commission', form.vendor_commission);
        formData.append('is_active', form.is_active ? '1' : '0');
        if (imageFile) formData.append('image', imageFile);

        if (isEditing) {
            formData.append('_method', 'PUT');
            router.post(`/admin/retail/items/${item!.id}`, formData, { forceFormData: true, onFinish: () => setProcessing(false) });
        } else {
            router.post('/admin/retail/items', formData, { forceFormData: true, onFinish: () => setProcessing(false) });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? `Edit ${item!.name}` : 'New Retail Item'} />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <a href="/admin/retail/items" className="hover:bg-accent rounded-md border p-2">
                        <ArrowLeft className="h-4 w-4" />
                    </a>
                    <h1 className="text-3xl font-bold">{isEditing ? 'Edit' : 'New'} Retail Item</h1>
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <div className="bg-card space-y-4 rounded-lg border p-6">
                        <h2 className="text-xl font-semibold">Basic Info</h2>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Name *</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full rounded-md border px-3 py-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Category *</label>
                            <select
                                value={form.retail_category_id}
                                onChange={(e) => setForm({ ...form, retail_category_id: e.target.value })}
                                className="w-full rounded-md border px-3 py-2"
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
                            <label className="mb-1 block text-sm font-medium">Supplier Vendor (Optional)</label>
                            <select
                                value={form.vendor_id}
                                onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}
                                className="w-full rounded-md border px-3 py-2"
                            >
                                <option value="">Canteen-owned (no vendor)</option>
                                {vendors.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-muted-foreground mt-1 text-xs">
                                If a vendor supplies this item, select them here for settlement at end of day
                            </p>
                        </div>
                        {form.vendor_id && (
                            <div>
                                <label className="mb-1 block text-sm font-medium">Vendor Commission (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={form.vendor_commission}
                                    onChange={(e) => setForm({ ...form, vendor_commission: e.target.value })}
                                    className="w-full rounded-md border px-3 py-2"
                                />
                                <p className="text-muted-foreground mt-1 text-xs">Percentage vendor receives from sales (rest goes to canteen)</p>
                            </div>
                        )}
                        <div>
                            <label className="mb-1 block text-sm font-medium">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="w-full rounded-md border px-3 py-2"
                                rows={2}
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
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    className="w-full rounded-md border px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Stock *</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.available_quantity}
                                    onChange={(e) => setForm({ ...form, available_quantity: e.target.value })}
                                    className="w-full rounded-md border px-3 py-2"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Low Stock Threshold</label>
                            <input
                                type="number"
                                min="0"
                                value={form.low_stock_threshold}
                                onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
                                className="w-full rounded-md border px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Image</label>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                            {imagePreview ? (
                                <div className="relative mt-1 inline-block">
                                    <img src={imagePreview} alt="Preview" className="h-32 w-32 rounded-lg border object-cover" />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-muted-foreground hover:bg-accent flex items-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm"
                                >
                                    <Upload className="h-4 w-4" /> Upload Photo
                                </button>
                            )}
                        </div>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                            <span className="text-sm">Available</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md py-3 text-lg font-medium disabled:opacity-50"
                    >
                        {processing ? 'Saving...' : isEditing ? 'Update Item' : 'Create Item'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
