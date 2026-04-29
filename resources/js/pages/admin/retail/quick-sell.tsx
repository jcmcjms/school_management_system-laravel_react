import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Package, Search } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface VendorProduct {
    id: number;
    name: string;
    price: number;
    stock_quantity: number;
    vendor: { name: string };
}

interface Props {
    products: VendorProduct[];
    vendors: { id: number; name: string }[];
}

const formatPrice = (p: number | string) => Number(p).toFixed(2);

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/staff/dashboard' },
    { title: 'Quick Sell', href: '/admin/retail/quick-sell' },
];

export default function QuickSell() {
    const { products, vendors } = usePage<Props>().props;
    const [search, setSearch] = useState('');
    const [vendorId, setVendorId] = useState('');
    const [selling, setSelling] = useState<{ product: VendorProduct; qty: number } | null>(null);
    const [qty, setQty] = useState(1);

    const filteredProducts = products.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesVendor = !vendorId || p.vendor.name === vendors.find(v => v.id.toString() === vendorId)?.name;
        return matchesSearch && matchesVendor && p.stock_quantity > 0;
    });

    const handleSell = (product: VendorProduct) => {
        setSelling({ product, qty: 1 });
    };

    const submitSale = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selling) return;
        router.post('/admin/retail/vendor-sales', {
            vendor_product_id: selling.product.id,
            quantity: selling.qty,
        }, { onFinish: () => setSelling(null) });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Quick Sell - Vendor Products" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Quick Sell</h1>
                        <p className="text-muted-foreground">Sell vendor products and track sales</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
                            className="w-full rounded-md border py-2 pl-10 pr-3" />
                    </div>
                    <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="rounded-md border px-3 py-2">
                        <option value="">All Vendors</option>
                        {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="rounded-lg border bg-card p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{product.name}</span>
                                <span className="text-xs text-muted-foreground">{product.vendor.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold">₱{formatPrice(product.price)}</span>
                                <span className="text-sm text-muted-foreground">{product.stock_quantity} left</span>
                            </div>
                            <button onClick={() => handleSell(product)} disabled={product.stock_quantity <= 0}
                                className="mt-3 w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                                <Plus className="mr-1 h-4 w-4 inline" /> Sell
                            </button>
                        </div>
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No vendor products available
                        </div>
                    )}
                </div>

                {selling && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelling(null)}>
                        <div className="w-full max-w-sm rounded-lg bg-card p-6" onClick={(e) => e.stopPropagation()}>
                            <h2 className="mb-4 text-xl font-semibold">Sell {selling.product.name}</h2>
                            <form onSubmit={submitSale} className="space-y-4">
                                <div className="rounded-md bg-muted p-4">
                                    <div className="flex justify-between text-sm">
                                        <span>Price per item:</span>
                                        <span className="font-medium">₱{formatPrice(selling.product.price)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-1">
                                        <span>Available:</span>
                                        <span className="font-medium">{selling.product.stock_quantity}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Quantity</label>
                                    <input type="number" min="1" max={selling.product.stock_quantity} value={selling.qty}
                                        onChange={(e) => setSelling({ ...selling, qty: parseInt(e.target.value) || 1 })}
                                        className="w-full rounded-md border px-3 py-2" />
                                </div>
                                <div className="rounded-md bg-primary/10 p-3 text-center">
                                    <span className="text-lg font-bold">Total: ₱{formatPrice(selling.product.price * selling.qty)}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setSelling(null)} className="flex-1 rounded-md border py-2">Cancel</button>
                                    <button type="submit" className="flex-1 rounded-md bg-primary py-2 font-medium text-primary-foreground">Confirm Sale</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}