import { Head, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface RetailCategory {
    id: number;
    name: string;
    description: string | null;
    sort_order: number;
    is_active: boolean;
    retail_items_count: number;
}

interface Props {
    categories: RetailCategory[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Retail Management', href: '/admin/retail/items' },
    { title: 'Categories', href: '/admin/retail/categories' },
];

export default function RetailCategories() {
    const { categories } = usePage<Props>().props;
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<RetailCategory | null>(null);
    const [form, setForm] = useState({ name: '', description: '', sort_order: 0, is_active: true });
    const [processing, setProcessing] = useState(false);

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', description: '', sort_order: categories.length, is_active: true });
        setShowForm(true);
    };

    const openEdit = (cat: RetailCategory) => {
        setEditing(cat);
        setForm({ name: cat.name, description: cat.description || '', sort_order: cat.sort_order, is_active: cat.is_active });
        setShowForm(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        if (editing) {
            router.put(`/admin/retail/categories/${editing.id}`, form, {
                onFinish: () => {
                    setProcessing(false);
                    setShowForm(false);
                },
            });
        } else {
            router.post('/admin/retail/categories', form, {
                onFinish: () => {
                    setProcessing(false);
                    setShowForm(false);
                },
            });
        }
    };

    const handleDelete = (cat: RetailCategory) => {
        if (confirm(`Delete "${cat.name}"?`)) {
            router.delete(`/admin/retail/categories/${cat.id}`);
        }
    };

    const toggleActive = (cat: RetailCategory) => {
        router.put(`/admin/retail/categories/${cat.id}`, { ...cat, is_active: !cat.is_active });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Retail Categories" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Retail Categories</h1>
                        <p className="text-muted-foreground">Categories for retail items (biscuits, candies, chocolates)</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="bg-primary text-primary-foreground inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </button>
                </div>

                <div className="bg-card rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Order</th>
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Items</th>
                                <th className="px-4 py-3 text-center font-medium">Status</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-muted/30 border-b">
                                    <td className="px-4 py-3">{cat.sort_order}</td>
                                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                                    <td className="text-muted-foreground px-4 py-3">{cat.retail_items_count}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => toggleActive(cat)}
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${cat.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                                        >
                                            {cat.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => openEdit(cat)} className="hover:bg-accent rounded p-1">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(cat)} className="rounded p-1 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-muted-foreground px-4 py-8 text-center">
                                        No categories yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
                        <div className="bg-card w-full max-w-md rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
                            <h2 className="mb-4 text-xl font-semibold">{editing ? 'Edit' : 'New'} Category</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                    <label className="mb-1 block text-sm font-medium">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="w-full rounded-md border px-3 py-2"
                                        rows={2}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Sort Order</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.sort_order}
                                        onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                                        className="w-full rounded-md border px-3 py-2"
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
