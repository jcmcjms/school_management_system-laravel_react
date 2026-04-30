import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle, DollarSign, Package } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Vendor {
    id: number;
    name: string;
}

interface Settlement {
    id: number;
    vendor: Vendor;
    settlement_date: string;
    total_sales: number;
    items_sold: number;
    vendor_share: number;
    canteen_share: number;
    items_returned: number;
    status: string;
}

interface TodaySales {
    total_sales: number;
    items_sold: number;
    current_stock: number;
    vendor_share: number;
    canteen_share: number;
}

interface Props {
    settlements: Settlement[];
    vendors: Vendor[];
    todaySales: Record<number, TodaySales>;
    filters: { vendor_id?: string; date: string };
}

const formatPrice = (p: number | string) => Number(p).toFixed(2);

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Vendor Settlements', href: '/admin/retail/settlements' },
];

export default function VendorSettlements() {
    const { settlements, vendors, todaySales, filters } = usePage<Props>().props;
    const [date, setDate] = useState(filters.date);
    const [vendorId, setVendorId] = useState(filters.vendor_id || '');
    const [showModal, setShowModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<number | null>(null);
    const [itemsReturned, setItemsReturned] = useState(0);
    const [processing, setProcessing] = useState(false);

    const handleFilter = () => {
        router.get('/admin/retail/settlements', { date, vendor_id: vendorId || undefined }, { preserveState: true });
    };

    const openSettlementModal = (vendorId: number) => {
        setSelectedVendor(vendorId);
        const sales = todaySales[vendorId];
        setItemsReturned(sales?.current_stock || 0);
        setShowModal(true);
    };

    const handleSettlement = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVendor) return;
        setProcessing(true);
        router.post(
            '/admin/retail/settlements',
            {
                vendor_id: selectedVendor,
                settlement_date: date,
                items_returned: itemsReturned,
            },
            {
                onFinish: () => {
                    setProcessing(false);
                    setShowModal(false);
                },
            },
        );
    };

    const vendorMap = Object.fromEntries(vendors.map((v) => [v.id, v.name]));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vendor Settlements" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Vendor Settlements</h1>
                        <p className="text-muted-foreground">Settle daily sales and return remaining items to vendors</p>
                    </div>
                </div>

                {/* Date Filter */}
                <div className="flex items-end gap-3">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-md border px-3 py-2" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Vendor</label>
                        <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="rounded-md border px-3 py-2">
                            <option value="">All Vendors</option>
                            {vendors.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {v.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button onClick={handleFilter} className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium">
                        Filter
                    </button>
                </div>

                {/* Today's Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {vendors.map((vendor) => {
                        const sales = todaySales[vendor.id] || { total_sales: 0, items_sold: 0, current_stock: 0, vendor_share: 0, canteen_share: 0 };
                        const hasSales = sales.total_sales > 0 || sales.current_stock > 0;
                        const isSettled = settlements.some((s) => s.vendor.id === vendor.id);

                        return (
                            <div key={vendor.id} className={`bg-card rounded-lg border p-6 ${isSettled ? 'opacity-60' : ''}`}>
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">{vendor.name}</h3>
                                    {isSettled ? (
                                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Settled</span>
                                    ) : (
                                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">Pending</span>
                                    )}
                                </div>

                                {hasSales ? (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <DollarSign className="h-4 w-4" /> Total Sales
                                            </span>
                                            <span className="font-medium">₱{formatPrice(sales.total_sales)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Package className="h-4 w-4" /> Items Sold
                                            </span>
                                            <span className="font-medium">{sales.items_sold}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Current Stock</span>
                                            <span className="font-medium">{sales.current_stock}</span>
                                        </div>
                                        <div className="mt-2 border-t pt-2">
                                            <div className="flex justify-between text-green-700">
                                                <span>Vendor Gets</span>
                                                <span className="font-bold">₱{formatPrice(sales.vendor_share)}</span>
                                            </div>
                                            <div className="flex justify-between text-purple-700">
                                                <span>Canteen Gets</span>
                                                <span className="font-bold">₱{formatPrice(sales.canteen_share)}</span>
                                            </div>
                                        </div>

                                        {!isSettled && (
                                            <button
                                                onClick={() => openSettlementModal(vendor.id)}
                                                className="bg-primary text-primary-foreground mt-3 flex w-full items-center justify-center gap-2 rounded-md py-2 text-sm font-medium"
                                            >
                                                <CheckCircle className="h-4 w-4" /> Settle & Return Items
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm">No sales today</p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Past Settlements */}
                {settlements.length > 0 && (
                    <div className="bg-card rounded-lg border">
                        <div className="border-b px-6 py-4">
                            <h2 className="text-lg font-semibold">Settlement History</h2>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Date</th>
                                    <th className="px-4 py-3 text-left font-medium">Vendor</th>
                                    <th className="px-4 py-3 text-right font-medium">Sales</th>
                                    <th className="px-4 py-3 text-right font-medium">Items Sold</th>
                                    <th className="px-4 py-3 text-right font-medium">Vendor Share</th>
                                    <th className="px-4 py-3 text-right font-medium">Returned</th>
                                    <th className="px-4 py-3 text-center font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {settlements.map((s) => (
                                    <tr key={s.id} className="border-b">
                                        <td className="px-4 py-3">{s.settlement_date}</td>
                                        <td className="px-4 py-3 font-medium">{s.vendor?.name}</td>
                                        <td className="px-4 py-3 text-right">₱{formatPrice(s.total_sales)}</td>
                                        <td className="px-4 py-3 text-right">{s.items_sold}</td>
                                        <td className="px-4 py-3 text-right font-medium text-green-600">₱{formatPrice(s.vendor_share)}</td>
                                        <td className="px-4 py-3 text-right">{s.items_returned}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                                            >
                                                {s.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Settlement Modal */}
                {showModal && selectedVendor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
                        <div className="bg-card w-full max-w-md rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
                            <h2 className="mb-4 text-xl font-semibold">Settle & Return Items</h2>
                            <p className="text-muted-foreground mb-4 text-sm">
                                Vendor: <span className="font-medium">{vendors.find((v) => v.id === selectedVendor)?.name}</span>
                            </p>
                            <form onSubmit={handleSettlement} className="space-y-4">
                                <div className="rounded-md bg-yellow-50 p-4 text-sm dark:bg-yellow-900">
                                    <p className="font-medium text-yellow-800">Settlement Summary</p>
                                    <div className="mt-2 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Total Sales:</span>
                                            <span>₱{formatPrice(todaySales[selectedVendor]?.total_sales || 0)}</span>
                                        </div>
                                        <div className="flex justify-between text-green-700">
                                            <span>Vendor (70%):</span>
                                            <span>₱{formatPrice(todaySales[selectedVendor]?.vendor_share || 0)}</span>
                                        </div>
                                        <div className="flex justify-between text-purple-700">
                                            <span>Canteen (30%):</span>
                                            <span>₱{formatPrice(todaySales[selectedVendor]?.canteen_share || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Items Returned to Vendor</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={itemsReturned}
                                        onChange={(e) => setItemsReturned(parseInt(e.target.value) || 0)}
                                        className="w-full rounded-md border px-3 py-2"
                                    />
                                    <p className="text-muted-foreground mt-1 text-xs">Current unsold stock will be returned to vendor</p>
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-md border py-2">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-primary text-primary-foreground flex-1 rounded-md py-2 font-medium"
                                    >
                                        {processing ? 'Processing...' : 'Complete Settlement'}
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
