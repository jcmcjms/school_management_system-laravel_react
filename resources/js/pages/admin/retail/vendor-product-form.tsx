import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Vendor {
    id: number;
    name: string;
}

interface VendorProduct {
    id: number;
    name: string;
    description: string | null;
    price: number;
    stock_quantity: number;
    is_active: boolean;
    image_url: string | null;
    vendor_id: number;
}

interface Props {
    product?: VendorProduct;
    vendors: Vendor[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Vendor Products', href: '/admin/retail/vendor-products' },
    { title: 'Add Product', href: '/admin/retail/vendor-products/create' },
];

export default function VendorProductForm() {
    const { product, vendors } = usePage<Props>().props;
    const isEditing = !!product;
    const [form, setForm] = useState({
        vendor_id: product?.vendor_id?.toString() || '',
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price?.toString() || '',
        stock_quantity: product?.stock_quantity?.toString() || '0',
        is_active: product?.is_active ?? true,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState(product?.image_url || null);
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
        formData.append('vendor_id', form.vendor_id);
        formData.append('name', form.name);
        formData.append('description', form.description);
        formData.append('price', form.price);
        formData.append('stock_quantity', form.stock_quantity);
        formData.append('is_active', form.is_active ? '1' : '0');
        if (imageFile) formData.append('image', imageFile);

        if (isEditing) {
            formData.append('_method', 'PUT');
            router.post(`/admin/retail/vendor-products/${product!.id}`, formData, { forceFormData: true, onFinish: () => setProcessing(false) });
        } else {
            router.post('/admin/retail/vendor-products', formData, { forceFormData: true, onFinish: () => setProcessing(false) });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? `Edit ${product!.name}` : 'New Vendor Product'} />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <a href="/admin/retail/vendor-products" className="hover:bg-accent rounded-md border p-2">
                        <ArrowLeft className="h-4 w-4" />
                    </a>
                    <h1 className="text-3xl font-bold">{isEditing ? 'Edit' : 'New'} Vendor Product</h1>
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <div className="bg-card space-y-4 rounded-lg border p-6">
                        <h2 className="text-xl font-semibold">Product Info</h2>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Vendor *</label>
                            <select
                                value={form.vendor_id}
                                onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}
                                className="w-full rounded-md border px-3 py-2"
                                required
                            >
                                <option value="">Select vendor</option>
                                {vendors.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">Product Name *</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full rounded-md border px-3 py-2"
                                required
                            />
                        </div>
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
                                    value={form.stock_quantity}
                                    onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                                    className="w-full rounded-md border px-3 py-2"
                                    required
                                />
                            </div>
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
                            <span className="text-sm">Active</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-primary text-primary-foreground w-full rounded-md py-3 text-lg font-medium disabled:opacity-50"
                    >
                        {processing ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
