import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData } from '@/types';

interface Vendor {
    id: number;
    name: string;
}

interface VendorProduct {
    id: number;
    name: string;
    price: number;
    stock_quantity: number;
    is_active: boolean;
    vendor: Vendor;
    image_url: string | null;
}

interface Props {
    products: PaginatedData<VendorProduct>;
    vendors: Vendor[];
    filters: { vendor_id?: string };
}

const formatPrice = (p: number | string) => Number(p).toFixed(2);

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Vendor Products', href: '/admin/retail/vendor-products' },
];

export default function VendorProducts() {
    const { products, vendors, filters } = usePage<Props>().props;
    const [vendorId, setVendorId] = useState(filters.vendor_id || '');

    const handleFilter = () => {
        router.get('/admin/retail/vendor-products', { vendor_id: vendorId || undefined }, { preserveState: true });
    };

    const handleDelete = (product: VendorProduct) => {
        if (confirm(`Delete "${product.name}"?`)) router.delete(`/admin/retail/vendor-products/${product.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vendor Products" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Vendor Products</h1>
                        <p className="text-muted-foreground">Products from external vendors</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/retail/vendors" className="hover:bg-accent rounded-md border px-4 py-2 text-sm">
                            Manage Vendors
                        </Link>
                        <Link
                            href="/admin/retail/vendor-products/create"
                            className="bg-primary text-primary-foreground inline-flex items-center rounded-md px-4 py-2 text-sm"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Link>
                    </div>
                </div>

                <div className="flex gap-3">
                    <select
                        value={vendorId}
                        onChange={(e) => {
                            setVendorId(e.target.value);
                            setTimeout(handleFilter, 0);
                        }}
                        className="rounded-md border px-3 py-2"
                    >
                        <option value="">All Vendors</option>
                        {vendors.map((v) => (
                            <option key={v.id} value={v.id}>
                                {v.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="bg-card rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Product</th>
                                <th className="px-4 py-3 text-left font-medium">Vendor</th>
                                <th className="px-4 py-3 text-right font-medium">Price</th>
                                <th className="px-4 py-3 text-right font-medium">Stock</th>
                                <th className="px-4 py-3 text-center font-medium">Status</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.data.map((product) => (
                                <tr key={product.id} className="hover:bg-muted/30 border-b">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {product.image_url && <img src={product.image_url} alt="" className="h-10 w-10 rounded object-cover" />}
                                            <span className="font-medium">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-muted-foreground px-4 py-3">{product.vendor?.name}</td>
                                    <td className="px-4 py-3 text-right font-medium">₱{formatPrice(product.price)}</td>
                                    <td className="px-4 py-3 text-right">{product.stock_quantity}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                                        >
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link href={`/admin/retail/vendor-products/${product.id}/edit`} className="hover:bg-accent rounded p-1">
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                            <button onClick={() => handleDelete(product)} className="rounded p-1 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-muted-foreground px-4 py-8 text-center">
                                        No products found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {products.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: products.last_page }, (_, i) => i + 1).map((page) => (
                            <Link
                                key={page}
                                href={`/admin/retail/vendor-products?page=${page}&vendor_id=${vendorId}`}
                                className={`rounded-md px-3 py-1 text-sm ${page === products.current_page ? 'bg-primary text-primary-foreground' : 'border'}`}
                            >
                                {page}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
