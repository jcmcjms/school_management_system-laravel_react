import { Head, router, usePage } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User, type PaginatedData } from '@/types';

interface AdminUsersProps {
    users: PaginatedData<User>;
    filters: { search?: string; role?: string };
    roles: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Users', href: '/admin/users' }];

const emptyUser = { name: '', email: '', password: '', role: 'student', student_id: '', employee_id: '', department: '', grade_level: '', section: '', position: '', phone: '', salary_deduction_limit: '0', is_active: true };

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

    const openCreate = () => { setForm(emptyUser); setEditingUser(null); setShowForm(true); setErrors({}); };
    const openEdit = (user: User) => {
        setForm({ name: user.name, email: user.email, password: '', role: user.role, student_id: user.student_id || '', employee_id: user.employee_id || '', department: user.department || '', grade_level: user.grade_level || '', section: user.section || '', position: user.position || '', phone: user.phone || '', salary_deduction_limit: user.salary_deduction_limit?.toString() || '0', is_active: user.is_active });
        setEditingUser(user); setShowForm(true); setErrors({});
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = { ...form, salary_deduction_limit: parseFloat(form.salary_deduction_limit) || 0 };
        if (!data.password) delete data.password;
        const opts = { onError: (errs: any) => setErrors(errs), onSuccess: () => setShowForm(false) };
        editingUser ? router.put(`/admin/users/${editingUser.id}`, data, opts) : router.post('/admin/users', data, opts);
    };

    const handleDelete = (user: User) => { if (confirm(`Delete "${user.name}"?`)) router.delete(`/admin/users/${user.id}`); };

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        const fileInput = document.getElementById('csv-file') as HTMLInputElement;
        if (!fileInput?.files?.[0]) return;
        const formData = new FormData();
        formData.append('csv_file', fileInput.files[0]);
        router.post('/admin/users/import', formData, { onSuccess: () => setShowImport(false) });
    };

    const inputCls = "w-full rounded-md border bg-background px-3 py-2 text-sm";

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div><h1 className="text-3xl font-bold tracking-tight">User Management</h1><p className="text-muted-foreground">Manage system users and roles</p></div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowImport(true)} className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"><Upload className="mr-2 h-4 w-4" /> Import CSV</button>
                        <button onClick={openCreate} className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Plus className="mr-2 h-4 w-4" /> Add User</button>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleFilter()} placeholder="Search users..." className="w-full rounded-md border bg-background py-2 pl-10 pr-3 text-sm" />
                    </div>
                    <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setTimeout(handleFilter, 0); }} className="rounded-md border bg-background px-3 py-2 text-sm">
                        <option value="">All Roles</option>
                        {Object.entries(roles).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                </div>

                <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Email</th>
                                <th className="px-4 py-3 text-left font-medium">Role</th>
                                <th className="px-4 py-3 text-center font-medium">Status</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((user) => (
                                <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{user.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                    <td className="px-4 py-3"><span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize">{user.role}</span></td>
                                    <td className="px-4 py-3 text-center"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.is_active ? 'Active' : 'Inactive'}</span></td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => openEdit(user)} className="rounded p-1 hover:bg-accent"><Edit className="h-4 w-4" /></button>
                                        <button onClick={() => handleDelete(user)} className="rounded p-1 hover:bg-red-50 dark:hover:bg-red-950"><Trash2 className="h-4 w-4 text-red-500" /></button>
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No users found</td></tr>}
                        </tbody>
                    </table>
                </div>

                {users.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: users.last_page }, (_, i) => i + 1).map((page) => (
                            <a key={page} href={`/admin/users?page=${page}&search=${search}&role=${roleFilter}`}
                                className={`rounded-md px-3 py-1 text-sm ${page === users.current_page ? 'bg-primary text-primary-foreground' : 'border hover:bg-accent'}`}>{page}</a>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
                    <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-4 text-xl font-semibold">{editingUser ? 'Edit User' : 'Create User'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div><label className="mb-1 block text-sm font-medium">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} required /></div>
                            <div><label className="mb-1 block text-sm font-medium">Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} required /></div>
                            <div><label className="mb-1 block text-sm font-medium">{editingUser ? 'New Password' : 'Password *'}</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} required={!editingUser} />{editingUser && <p className="mt-1 text-xs text-muted-foreground">Leave blank to keep current</p>}</div>
                            <div><label className="mb-1 block text-sm font-medium">Role *</label>
                                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>{Object.entries(roles).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                            </div>
                            {(form.role === 'student') && (<div className="grid grid-cols-3 gap-2"><div><label className="mb-1 block text-xs font-medium">Student ID</label><input value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} className={inputCls} /></div><div><label className="mb-1 block text-xs font-medium">Grade</label><input value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: e.target.value })} className={inputCls} /></div><div><label className="mb-1 block text-xs font-medium">Section</label><input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className={inputCls} /></div></div>)}
                            {(form.role === 'faculty') && (<div className="space-y-2"><div className="grid grid-cols-2 gap-2"><div><label className="mb-1 block text-xs font-medium">Employee ID</label><input value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} className={inputCls} /></div><div><label className="mb-1 block text-xs font-medium">Department</label><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputCls} /></div></div><div><label className="mb-1 block text-xs font-medium">Salary Deduction Limit (₱)</label><input type="number" min="0" step="0.01" value={form.salary_deduction_limit} onChange={(e) => setForm({ ...form, salary_deduction_limit: e.target.value })} className={inputCls} /></div></div>)}
                            <div><label className="mb-1 block text-sm font-medium">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} /></div>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-primary" /><span className="text-sm">Active</span></label>
                            {Object.values(errors).length > 0 && <div className="rounded bg-red-50 p-2 text-sm text-red-600 dark:bg-red-950">{Object.values(errors).map((e, i) => <p key={i}>{e}</p>)}</div>}
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-md border py-2 text-sm hover:bg-accent">Cancel</button>
                                <button type="submit" className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">{editingUser ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CSV Import Modal */}
            {showImport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowImport(false)}>
                    <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="mb-4 text-xl font-semibold">Import Users from CSV</h2>
                        <form onSubmit={handleImport} className="space-y-4">
                            <p className="text-sm text-muted-foreground">Required columns: <strong>name, email, role</strong>. Optional: student_id, employee_id, department, phone, salary_deduction_limit</p>
                            <input id="csv-file" type="file" accept=".csv,.txt" className={inputCls} required />
                            <p className="text-xs text-muted-foreground">All imported users get temporary password: <code>password123</code></p>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setShowImport(false)} className="flex-1 rounded-md border py-2 text-sm hover:bg-accent">Cancel</button>
                                <button type="submit" className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Import</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
