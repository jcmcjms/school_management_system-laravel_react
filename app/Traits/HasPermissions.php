<?php

namespace App\Traits;

use App\Models\Role;
use Illuminate\Support\Collection;

trait HasPermissions
{
    /**
     * Get the Role model associated with this user's role string.
     */
    public function getRoleModel(): ?Role
    {
        return Role::findByName($this->role);
    }

    /**
     * Check if the user has a specific permission through their role.
     */
    public function hasPermission(string $permission): bool
    {
        // Admin always has all permissions
        if ($this->role === 'admin') {
            return true;
        }

        $role = $this->getRoleModel();

        return $role ? $role->hasPermission($permission) : false;
    }

    /**
     * Check if the user has any of the given permissions.
     */
    public function hasAnyPermission(string ...$permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if the user has all of the given permissions.
     */
    public function hasAllPermissions(string ...$permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->hasPermission($permission)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get all permission names for the user's role.
     */
    public function getAllPermissions(): Collection
    {
        // Admin gets all permissions
        if ($this->role === 'admin') {
            return \App\Models\Permission::pluck('name');
        }

        $role = $this->getRoleModel();

        return $role ? $role->permissions->pluck('name') : collect();
    }
}
