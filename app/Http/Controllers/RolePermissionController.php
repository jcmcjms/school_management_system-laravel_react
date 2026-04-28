<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RolePermissionController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->orderBy('name')->get();
        $permissions = Permission::orderBy('group')->orderBy('name')->get();

        // Group permissions by their group field
        $permissionGroups = $permissions->groupBy('group')->map(function ($group, $groupName) {
            return [
                'name' => ucfirst(str_replace('_', ' ', $groupName)),
                'permissions' => $group->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'name' => $p->name,
                        'display_name' => $p->display_name,
                        'description' => $p->description,
                    ];
                })->values(),
            ];
        })->values();

        // Build role-permission matrix
        $rolesData = $roles->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name,
                'description' => $role->description,
                'is_system' => $role->is_system,
                'permission_ids' => $role->permissions->pluck('id')->toArray(),
            ];
        });

        return Inertia::render('admin/roles/index', [
            'roles' => $rolesData,
            'permissionGroups' => $permissionGroups,
        ]);
    }

    public function updatePermissions(Request $request, Role $role)
    {
        $request->validate([
            'permission_ids' => 'present|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $role->syncPermissions($request->permission_ids);

        // Clear the static cache so changes take effect immediately
        Role::clearCache();

        return back()->with('success', "Permissions updated for {$role->display_name}.");
    }
}
