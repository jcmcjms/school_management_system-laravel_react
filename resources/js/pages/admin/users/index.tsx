import { Head, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData, type User } from '@/types';

interface AdminUsersProps {
    users: PaginatedData<User>;
    filters: { search?: string; role?: string };
    roles: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Users', href: '/admin/users' },
];

const emptyUser = {
    name: '',
    email: '',
    password: '',
    role: 'student',
    student_id: '',
    employee_id: '',
    department: '',
    grade_level: '',
    section: '',
    position: '',
    phone: '',
    salary_deduction_limit: '0',
    is_active: true,
};

export default function AdminUsersIndex() {
    const { users, filters, roles } = usePage<AdminUsersProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [form, setForm] = useState<any>(emptyUser);
    const [showImport, setShowImport] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleFilter = () => router.get('/admin/users', { search: search || undefined, role: roleFilter || undefined }, { preserveState: true });

    const openCreate = () => {
        setForm(emptyUser);
        setEditingUser(null);
        setShowForm(true);
        setErrors({});
    };
    const openEdit = (user: User) => {
        setForm({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            student_id: user.student_id || '',
            employee_id: user.employee_id || '',
            department: user.department || '',
            grade_level: user.grade_level || '',
            section: user.section || '',
            position: user.position || '',
            phone: user.phone || '',
            salary_deduction_limit: user.salary_deduction_limit?.toString() || '0',
            is_active: user.is_active,
        });
        setEditingUser(user);
        setShowForm(true);
        setErrors({});
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = { ...form, salary_deduction_limit: parseFloat(form.salary_deduction_limit) || 0 };
        if (!data.password) delete data.password;
        const opts = { onError: (errs: any) => setErrors(errs), onSuccess: () => setShowForm(false) };
        editingUser ? router.put(`/admin/users/${editingUser.id}`, data, opts) : router.post('/admin/users', data, opts);
    };

    const handleDelete = (user: User) => {
        if (confirm(`Delete "${user.name}"?`)) router.delete(`/admin/users/${user.id}`);
    };

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        const fileInput = document.getElementById('csv-file') as HTMLInputElement;
        if (!fileInput?.files?.[0]) return;
        const formData = new FormData();
        formData.append('csv_file', fileInput.files[0]);
        router.post('/admin/users/import', formData, { onSuccess: () => setShowImport(false) });
    };

    const inputCls = 'w-full rounded-md border bg-background px-3 py-2 text-sm';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">User Management</h1>
                        <p className="text-muted-foreground text-sm">Manage system users and roles</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowImport(true)}
                            className="hover:bg-accent inline-flex items-center rounded-md border px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm"
                        >
                            <Upload className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> Import
                        </button>
                        <button
                            onClick={openCreate}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm"
                        >
                            <Plus className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> Add
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            placeholder="Search users..."
                            className="bg-background w-full rounded-md border py-2 pr-3 pl-9 text-sm"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setTimeout(handleFilter, 0);
                        }}
                        className="bg-background min-w-[100px] rounded-md border px-3 py-2 text-sm"
                    >
                        <option value="">All Roles</option>
                        {Object.entries(roles).map(([k, v]) => (
                            <option key={k} value={k}>
                                {v}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="bg-card overflow-hidden rounded-lg border shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="px-3 py-2.5 text-left font-medium sm:px-4 sm:py-3">Name</th>
                                    <th className="px-3 py-2.5 text-left font-medium sm:px-4 sm:py-3">Email</th>
                                    <th className="hidden px-3 py-2.5 text-left font-medium sm:table-cell sm:px-4 sm:py-3">Role</th>
                                    <th className="px-3 py-2.5 text-center font-medium sm:px-4 sm:py-3">Status</th>
                                    <th className="px-3 py-2.5 text-right font-medium sm:px-4 sm:py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/30 border-b last:border-0">
                                        <td className="px-3 py-2.5 font-medium sm:px-4 sm:py-3">{user.name}</td>
                                        <td className="text-muted-foreground px-3 py-2.5 sm:px-4 sm:py-3">{user.email}</td>
                                        <td className="hidden px-3 py-2.5 sm:table-cell sm:px-4 sm:py-3">
                                            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium capitalize">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-center sm:px-4 sm:py-3">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                            >
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-right sm:px-4 sm:py-3">
                                            <button onClick={() => openEdit(user)} className="hover:bg-accent rounded p-1.5" title="Edit">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                className="rounded p-1.5 hover:bg-red-50 dark:hover:bg-red-950"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-muted-foreground px-4 py-8 text-center">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {users.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: users.last_page }, (_, i) => i + 1).map((page) => (
                            <a
                                key={page}
                                href={`/admin/users?page=${page}&search=${search}&role=${roleFilter}`}
                                className={`rounded-md px-3 py-1 text-sm ${page === users.current_page ? 'bg-primary text-primary-foreground' : 'hover:bg-accent border'}`}
                            >
                                {page}
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
                    <div
                        className="bg-card max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="mb-4 text-xl font-semibold">{editingUser ? 'Edit User' : 'Create User'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Name *</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} required />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Email *</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className={inputCls}
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">{editingUser ? 'New Password' : 'Password *'}</label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className={inputCls}
                                    required={!editingUser}
                                />
                                {editingUser && <p className="text-muted-foreground mt-1 text-xs">Leave blank to keep current</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Role *</label>
                                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
                                    {Object.entries(roles).map(([k, v]) => (
                                        <option key={k} value={k}>
                                            {v}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {form.role === 'student' && (
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium">Student ID</label>
                                        <input
                                            value={form.student_id}
                                            onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium">Grade</label>
                                        <input
                                            value={form.grade_level}
                                            onChange={(e) => setForm({ ...form, grade_level: e.target.value })}
                                            className={inputCls}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium">Section</label>
                                        <input
                                            value={form.section}
                                            onChange={(e) => setForm({ ...form, section: e.target.value })}
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                            )}
                            {form.role === 'faculty' && (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium">Employee ID</label>
                                            <input
                                                value={form.employee_id}
                                                onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                                                className={inputCls}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium">Department</label>
                                            <input
                                                value={form.department}
                                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                                                className={inputCls}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium">Salary Deduction Limit (₱)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.salary_deduction_limit}
                                            onChange={(e) => setForm({ ...form, salary_deduction_limit: e.target.value })}
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="mb-1 block text-sm font-medium">Phone</label>
                                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
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
                            {Object.values(errors).length > 0 && (
                                <div className="rounded bg-red-50 p-2 text-sm text-red-600 dark:bg-red-950">
                                    {Object.values(errors).map((e, i) => (
                                        <p key={i}>{e}</p>
                                    ))}
                                </div>
                            )}
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
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-md py-2 text-sm font-medium"
                                >
                                    {editingUser ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CSV Import Modal */}
            {showImport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowImport(false)}>
                    <div className="bg-card w-full max-w-md rounded-lg p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-4 text-xl font-semibold">Import Users from CSV</h2>
                        <form onSubmit={handleImport} className="space-y-4">
                            <p className="text-muted-foreground text-sm">
                                Required columns: <strong>name, email, role</strong>. Optional: student_id, employee_id, department, phone,
                                salary_deduction_limit
                            </p>
                            <input id="csv-file" type="file" accept=".csv,.txt" className={inputCls} required />
                            <p className="text-muted-foreground text-xs">
                                All imported users get temporary password: <code>password123</code>
                            </p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowImport(false)}
                                    className="hover:bg-accent flex-1 rounded-md border py-2 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 rounded-md py-2 text-sm font-medium"
                                >
                                    Import
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
