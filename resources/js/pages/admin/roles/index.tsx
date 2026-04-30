import { Head, router, usePage } from '@inertiajs/react';
import { Check, Save, Shield } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface PermissionItem {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
}

interface PermissionGroup {
    name: string;
    permissions: PermissionItem[];
}

interface RoleItem {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    is_system: boolean;
    permission_ids: number[];
}

interface RolesPageProps {
    roles: RoleItem[];
    permissionGroups: PermissionGroup[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Roles & Permissions', href: '/admin/roles' },
];

export default function AdminRolesIndex() {
    const { roles, permissionGroups } = usePage<RolesPageProps>().props;
    const [localRoles, setLocalRoles] = useState<Record<number, number[]>>(Object.fromEntries(roles.map((r) => [r.id, [...r.permission_ids]])));
    const [saving, setSaving] = useState<number | null>(null);
    const [saved, setSaved] = useState<number | null>(null);

    const isAdmin = (role: RoleItem) => role.name === 'admin';

    const togglePermission = (roleId: number, permId: number) => {
        setLocalRoles((prev) => {
            const current = prev[roleId] || [];
            const updated = current.includes(permId) ? current.filter((id) => id !== permId) : [...current, permId];
            return { ...prev, [roleId]: updated };
        });
    };

    const hasChanged = (role: RoleItem) => {
        const current = localRoles[role.id] || [];
        const original = role.permission_ids;
        if (current.length !== original.length) return true;
        return current.some((id) => !original.includes(id)) || original.some((id) => !current.includes(id));
    };

    const saveRole = (role: RoleItem) => {
        setSaving(role.id);
        router.put(
            `/admin/roles/${role.id}/permissions`,
            { permission_ids: localRoles[role.id] || [] },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSaving(null);
                    setSaved(role.id);
                    setTimeout(() => setSaved(null), 2000);
                },
                onError: () => setSaving(null),
            },
        );
    };

    // Get all unique permissions across all groups
    const allPermissions = permissionGroups.flatMap((g) => g.permissions);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles & Permissions" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center gap-3">
                    <Shield className="text-primary h-8 w-8" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                        <p className="text-muted-foreground">Configure what each role can do. Admin always has full access.</p>
                    </div>
                </div>

                {/* Permission Matrix */}
                <div className="bg-card overflow-x-auto rounded-lg border shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 sticky top-0 border-b">
                            <tr>
                                <th className="bg-muted/50 sticky left-0 z-10 min-w-[220px] px-4 py-3 text-left font-medium">Permission</th>
                                {roles.map((role) => (
                                    <th key={role.id} className="min-w-[120px] px-4 py-3 text-center font-medium">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="capitalize">{role.display_name}</span>
                                            {isAdmin(role) && <span className="text-primary text-[10px] font-normal">All Access</span>}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {permissionGroups.map((group) => (
                                <>
                                    {/* Group Header */}
                                    <tr key={`group-${group.name}`}>
                                        <td
                                            colSpan={roles.length + 1}
                                            className="bg-primary/5 text-primary px-4 py-2 text-xs font-semibold tracking-wider uppercase"
                                        >
                                            {group.name}
                                        </td>
                                    </tr>

                                    {/* Permission Rows */}
                                    {group.permissions.map((perm) => (
                                        <tr key={perm.id} className="hover:bg-muted/30 border-b last:border-0">
                                            <td className="bg-card sticky left-0 z-10 px-4 py-2.5">
                                                <div>
                                                    <p className="font-medium">{perm.display_name}</p>
                                                    {perm.description && <p className="text-muted-foreground text-xs">{perm.description}</p>}
                                                </div>
                                            </td>
                                            {roles.map((role) => {
                                                const checked = isAdmin(role) ? true : (localRoles[role.id] || []).includes(perm.id);
                                                const disabled = isAdmin(role);

                                                return (
                                                    <td key={role.id} className="px-4 py-2.5 text-center">
                                                        <label className="inline-flex cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                disabled={disabled}
                                                                onChange={() => togglePermission(role.id, perm.id)}
                                                                className="accent-primary h-4 w-4 rounded border-gray-300 disabled:opacity-50"
                                                            />
                                                        </label>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Save Buttons per Role */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {roles
                        .filter((r) => !isAdmin(r))
                        .map((role) => (
                            <div
                                key={role.id}
                                className={`flex items-center justify-between rounded-lg border p-4 ${
                                    hasChanged(role) ? 'border-primary bg-primary/5' : 'bg-card'
                                }`}
                            >
                                <div>
                                    <p className="font-medium">{role.display_name}</p>
                                    <p className="text-muted-foreground text-xs">{role.description}</p>
                                    <p className="text-muted-foreground mt-1 text-xs">{(localRoles[role.id] || []).length} permissions</p>
                                </div>
                                <button
                                    onClick={() => saveRole(role)}
                                    disabled={!hasChanged(role) || saving === role.id}
                                    className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                                        saved === role.id
                                            ? 'bg-green-600 text-white'
                                            : hasChanged(role)
                                              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                              : 'text-muted-foreground border'
                                    } disabled:opacity-50`}
                                >
                                    {saving === role.id ? (
                                        'Saving...'
                                    ) : saved === role.id ? (
                                        <>
                                            <Check className="mr-1 h-4 w-4" /> Saved
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-1 h-4 w-4" /> Save
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                </div>
            </div>
        </AppLayout>
    );
}
