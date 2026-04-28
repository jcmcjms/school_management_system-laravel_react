<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    protected $fillable = [
        'name',
        'display_name',
        'description',
        'is_system',
    ];

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
        ];
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permission');
    }

    public function hasPermission(string $permission): bool
    {
        return $this->permissions->contains('name', $permission);
    }

    public function grantPermission(string|Permission $permission): void
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->firstOrFail();
        }

        if (!$this->permissions->contains($permission->id)) {
            $this->permissions()->attach($permission->id);
            $this->unsetRelation('permissions');
        }
    }

    public function revokePermission(string|Permission $permission): void
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->firstOrFail();
        }

        $this->permissions()->detach($permission->id);
        $this->unsetRelation('permissions');
    }

    public function syncPermissions(array $permissionIds): void
    {
        $this->permissions()->sync($permissionIds);
        $this->unsetRelation('permissions');
    }

    /**
     * Static cache for role lookups.
     */
    protected static array $roleCache = [];

    /**
     * Get role by name, with permissions cached.
     */
    public static function findByName(string $name): ?self
    {
        if (!isset(static::$roleCache[$name])) {
            static::$roleCache[$name] = static::with('permissions')->where('name', $name)->first();
        }

        return static::$roleCache[$name];
    }

    /**
     * Clear the static lookup cache (e.g., after permission changes).
     */
    public static function clearCache(): void
    {
        static::$roleCache = [];
    }
}
