import { Head, router, usePage } from '@inertiajs/react';
import { Mail, Pencil, Phone, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Vendor {
    id: number;
    name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    is_active: boolean;
    products_count: number;
}

interface Props {
    vendors: Vendor[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Vendors', href: '/admin/retail/vendors' },
];

export default function Vendors() {
    const { vendors } = usePage<Props>().props;
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Vendor | null>(null);
    const [form, setForm] = useState({ name: '', contact_person: '', phone: '', email: '', address: '', notes: '', is_active: true });
    const [processing, setProcessing] = useState(false);

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', contact_person: '', phone: '', email: '', address: '', notes: '', is_active: true });
        setShowForm(true);
    };

    const openEdit = (v: Vendor) => {
        setEditing(v);
        setForm({
            name: v.name,
            contact_person: v.contact_person || '',
            phone: v.phone || '',
            email: v.email || '',
            address: v.address || '',
            notes: '',
            is_active: v.is_active,
        });
        setShowForm(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        if (editing) {
            router.put(`/admin/retail/vendors/${editing.id}`, form, {
                onFinish: () => {
                    setProcessing(false);
                    setShowForm(false);
                },
            });
        } else {
            router.post('/admin/retail/vendors', form, {
                onFinish: () => {
                    setProcessing(false);
                    setShowForm(false);
                },
            });
        }
    };

    const handleDelete = (v: Vendor) => {
        if (confirm(`Delete vendor "${v.name}"? All their products will also be deleted.`)) {
            router.delete(`/admin/retail/vendors/${v.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="External Vendors" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">External Vendors</h1>
                        <p className="text-muted-foreground">Manage external sellers who sell products in the canteen</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={openCreate}
                            className="bg-primary text-primary-foreground inline-flex items-center rounded-md px-4 py-2 text-sm"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Vendor
                        </button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {vendors.map((vendor) => (
                        <div key={vendor.id} className="bg-card rounded-lg border p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">{vendor.name}</h3>
                                    {vendor.contact_person && <p className="text-muted-foreground text-sm">{vendor.contact_person}</p>}
                                </div>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${vendor.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    {vendor.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="mt-4 space-y-2 text-sm">
                                {vendor.phone && (
                                    <div className="text-muted-foreground flex items-center gap-2">
                                        <Phone className="h-4 w-4" /> {vendor.phone}
                                    </div>
                                )}
                                {vendor.email && (
                                    <div className="text-muted-foreground flex items-center gap-2">
                                        <Mail className="h-4 w-4" /> {vendor.email}
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t pt-4">
                                <span className="text-muted-foreground text-sm">{vendor.products_count} products</span>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(vendor)} className="hover:bg-accent rounded p-1">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDelete(vendor)} className="rounded p-1 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {vendors.length === 0 && (
                        <div className="text-muted-foreground col-span-full py-12 text-center">No vendors yet. Add one to get started.</div>
                    )}
                </div>

                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
                        <div className="bg-card w-full max-w-md rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
                            <h2 className="mb-4 text-xl font-semibold">{editing ? 'Edit' : 'New'} Vendor</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Vendor Name *</label>
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full rounded-md border px-3 py-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Contact Person</label>
                                    <input
                                        value={form.contact_person}
                                        onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                                        className="w-full rounded-md border px-3 py-2"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">Phone</label>
                                        <input
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className="w-full rounded-md border px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">Email</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="w-full rounded-md border px-3 py-2"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Address</label>
                                    <textarea
                                        value={form.address}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        className="w-full rounded-md border px-3 py-2"
                                        rows={2}
                                    />
                                </div>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active}
                                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                    />
                                    <span className="text-sm">Active</span>
                                </label>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-md border py-2">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={processing} className="bg-primary text-primary-foreground flex-1 rounded-md py-2">
                                        {processing ? 'Saving...' : 'Save'}
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
