import { Head, router, usePage } from '@inertiajs/react';
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type MenuCategory } from '@/types';

interface CategoryPageProps {
    categories: MenuCategory[];
}

interface CategoryForm {
    id?: number;
    name: string;
    description: string;
    sort_order: number;
    is_active: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Menu', href: '/admin/menu' },
    { title: 'Categories', href: '/admin/categories' },
];

export default function AdminCategories() {
    const { categories } = usePage<CategoryPageProps>().props;
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryForm | null>(null);
    const [form, setForm] = useState<CategoryForm>({
        name: '',
        description: '',
        sort_order: 0,
        is_active: true,
    });
    const [processing, setProcessing] = useState(false);

    const openCreate = () => {
        setEditingCategory(null);
        setForm({ name: '', description: '', sort_order: categories.length, is_active: true });
        setShowForm(true);
    };

    const openEdit = (cat: MenuCategory) => {
        setEditingCategory(cat);
        setForm({
            name: cat.name,
            description: cat.description || '',
            sort_order: cat.sort_order,
            is_active: cat.is_active,
        });
        setShowForm(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        const data = {
            name: form.name,
            description: form.description || null,
            sort_order: form.sort_order,
            is_active: form.is_active,
        };

        if (editingCategory?.id) {
            router.put(`/admin/categories/${editingCategory.id}`, data, {
                onFinish: () => {
                    setProcessing(false);
                    setShowForm(false);
                },
            });
        } else {
            router.post('/admin/categories', data, {
                onFinish: () => {
                    setProcessing(false);
                    setShowForm(false);
                },
            });
        }
    };

    const handleDelete = (cat: MenuCategory) => {
        if (confirm(`Delete category "${cat.name}"? This will also delete ${cat.menu_items_count || 0} menu items if any exist.`)) {
            router.delete(`/admin/categories/${cat.id}`);
        }
    };

    const toggleActive = (cat: MenuCategory) => {
        router.put(`/admin/categories/${cat.id}`, { ...cat, is_active: !cat.is_active });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Category Management" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
                        <p className="text-muted-foreground">Organize your menu items into categories</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </button>
                </div>

                {/* Categories Table */}
                <div className="bg-card overflow-hidden rounded-lg border shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="w-16 px-4 py-3 text-left font-medium">Order</th>
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Description</th>
                                <th className="px-4 py-3 text-center font-medium">Items</th>
                                <th className="px-4 py-3 text-center font-medium">Status</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-muted/30 border-b last:border-0">
                                    <td className="text-muted-foreground px-4 py-3">
                                        <GripVertical className="h-4 w-4 cursor-grab" />
                                    </td>
                                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                                    <td className="text-muted-foreground px-4 py-3">{cat.description || '—'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="bg-muted inline-flex items-center rounded-full px-2 py-0.5 text-xs">
                                            {cat.menu_items_count || 0}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => toggleActive(cat)}
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                cat.is_active
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                            }`}
                                        >
                                            {cat.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(cat)} className="hover:bg-accent rounded p-1">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(cat)} className="rounded p-1 hover:bg-red-50 dark:hover:bg-red-950">
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-muted-foreground px-4 py-8 text-center">
                                        No categories yet. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Create/Edit Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
                        <div className="bg-card w-full max-w-md rounded-lg p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <h2 className="mb-4 text-xl font-semibold">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Name *</label>
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="bg-background w-full rounded-md border px-3 py-2 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="bg-background w-full rounded-md border px-3 py-2 text-sm"
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
                                        className="bg-background w-full rounded-md border px-3 py-2 text-sm"
                                    />
                                </div>
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active}
                                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                        className="accent-primary"
                                    />
                                    <span className="text-sm">Active</span>
                                </label>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="hover:bg-accent flex-1 rounded-md border py-2 text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-md py-2 text-sm font-medium disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
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
