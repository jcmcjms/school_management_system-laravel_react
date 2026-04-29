<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // ── Create Roles ──────────────────────────────────────────────
        $admin   = Role::firstOrCreate(['name' => 'admin'],   ['display_name' => 'Admin',   'description' => 'Full system access',              'is_system' => true]);
        $manager = Role::firstOrCreate(['name' => 'manager'], ['display_name' => 'Manager', 'description' => 'Canteen operations manager',      'is_system' => true]);
        $staff   = Role::firstOrCreate(['name' => 'staff'],   ['display_name' => 'Staff',   'description' => 'Kitchen and counter staff',       'is_system' => true]);
        $librarian = Role::firstOrCreate(['name' => 'librarian'], ['display_name' => 'Librarian', 'description' => 'Library operations manager', 'is_system' => true]);
        $faculty = Role::firstOrCreate(['name' => 'faculty'], ['display_name' => 'Faculty', 'description' => 'Teaching staff with salary deduction', 'is_system' => true]);
        $student = Role::firstOrCreate(['name' => 'student'], ['display_name' => 'Student', 'description' => 'Enrolled student',               'is_system' => true]);
        $parent  = Role::firstOrCreate(['name' => 'parent'],  ['display_name' => 'Parent',  'description' => 'Student guardian',                'is_system' => true]);

        // ── Create Permissions (grouped) ──────────────────────────────
        $permissions = [
            ['name' => 'view_admin_dashboard', 'display_name' => 'View Admin Dashboard', 'group' => 'dashboard'],
            ['name' => 'view_kitchen', 'display_name' => 'View Kitchen Dashboard', 'group' => 'dashboard'],
            ['name' => 'manage_menu', 'display_name' => 'Manage Menu Items', 'description' => 'Create, edit, delete menu items', 'group' => 'menu'],
            ['name' => 'manage_categories', 'display_name' => 'Manage Categories', 'description' => 'Create, edit, delete categories', 'group' => 'menu'],
            ['name' => 'manage_users', 'display_name' => 'Manage Users', 'description' => 'Create, edit, delete users', 'group' => 'users'],
            ['name' => 'import_users', 'display_name' => 'Import Users (CSV)', 'description' => 'Bulk import users from CSV', 'group' => 'users'],
            ['name' => 'manage_inventory', 'display_name' => 'Manage Inventory', 'description' => 'Create, edit inventory items', 'group' => 'inventory'],
            ['name' => 'add_inventory_stock', 'display_name' => 'Add Inventory Stock', 'description' => 'Add stock to inventory items', 'group' => 'inventory'],
            ['name' => 'view_revenue', 'display_name' => 'View Revenue Dashboard', 'group' => 'revenue'],
            ['name' => 'export_revenue', 'display_name' => 'Export Revenue CSV', 'group' => 'revenue'],
            ['name' => 'manage_deduction_limits', 'display_name' => 'Manage Salary Deduction Limits', 'group' => 'faculty'],
            ['name' => 'update_order_status', 'display_name' => 'Update Order Status', 'group' => 'kitchen'],
            ['name' => 'confirm_payment', 'display_name' => 'Confirm Payment', 'group' => 'kitchen'],
            ['name' => 'redeem_reservation', 'display_name' => 'Redeem Reservation QR', 'group' => 'kitchen'],
            ['name' => 'place_order', 'display_name' => 'Place Orders', 'group' => 'ordering'],
            ['name' => 'view_own_orders', 'display_name' => 'View Own Orders', 'group' => 'ordering'],
            ['name' => 'use_salary_deduction', 'display_name' => 'Pay via Salary Deduction', 'group' => 'ordering'],
            ['name' => 'browse_menu', 'display_name' => 'Browse Menu', 'group' => 'general'],
            ['name' => 'manage_roles', 'display_name' => 'Manage Roles & Permissions', 'group' => 'system'],
            ['name' => 'manage_library', 'display_name' => 'Manage Library', 'description' => 'Full library management access', 'group' => 'library'],
            ['name' => 'view_library', 'display_name' => 'View Library', 'description' => 'Browse and borrow library books', 'group' => 'library'],
            ['name' => 'borrow_books', 'display_name' => 'Borrow Books', 'description' => 'Borrow books from library', 'group' => 'library'],
            ['name' => 'reserve_books', 'display_name' => 'Reserve Books', 'description' => 'Reserve unavailable books', 'group' => 'library'],
            ['name' => 'manage_borrowings', 'display_name' => 'Manage Borrowings', 'description' => 'Process returns and manage borrowings', 'group' => 'library'],
            ['name' => 'manage_fines', 'display_name' => 'Manage Fines', 'description' => 'Track and manage library fines', 'group' => 'library'],
        ];

        $permissionModels = [];
        foreach ($permissions as $perm) {
            $permissionModels[$perm['name']] = Permission::firstOrCreate(['name' => $perm['name']], $perm);
        }

        // ── Assign Permissions to Roles ───────────────────────────────
        // Admin gets ALL permissions
        $admin->permissions()->sync(Permission::pluck('id'));

        // Manager
        $manager->permissions()->sync([
            $permissionModels['view_admin_dashboard']->id,
            $permissionModels['manage_menu']->id,
            $permissionModels['manage_categories']->id,
            $permissionModels['manage_inventory']->id,
            $permissionModels['add_inventory_stock']->id,
            $permissionModels['view_revenue']->id,
            $permissionModels['export_revenue']->id,
            $permissionModels['manage_deduction_limits']->id,
            $permissionModels['place_order']->id,
            $permissionModels['view_own_orders']->id,
            $permissionModels['use_salary_deduction']->id,
            $permissionModels['browse_menu']->id,
        ]);

        // Staff
        $staff->permissions()->sync([
            $permissionModels['view_kitchen']->id,
            $permissionModels['update_order_status']->id,
            $permissionModels['confirm_payment']->id,
            $permissionModels['redeem_reservation']->id,
            $permissionModels['add_inventory_stock']->id,
            $permissionModels['manage_menu']->id,
            $permissionModels['manage_categories']->id,
            $permissionModels['place_order']->id,
            $permissionModels['view_own_orders']->id,
            $permissionModels['use_salary_deduction']->id,
            $permissionModels['browse_menu']->id,
        ]);

        // Librarian
        $librarian->permissions()->sync([
            $permissionModels['manage_library']->id,
            $permissionModels['view_library']->id,
            $permissionModels['borrow_books']->id,
            $permissionModels['reserve_books']->id,
            $permissionModels['manage_borrowings']->id,
            $permissionModels['manage_fines']->id,
            $permissionModels['view_own_orders']->id,
            $permissionModels['place_order']->id,
            $permissionModels['browse_menu']->id,
        ]);

        // Faculty
        $faculty->permissions()->sync([
            $permissionModels['place_order']->id,
            $permissionModels['view_own_orders']->id,
            $permissionModels['use_salary_deduction']->id,
            $permissionModels['browse_menu']->id,
            $permissionModels['view_library']->id,
            $permissionModels['borrow_books']->id,
            $permissionModels['reserve_books']->id,
        ]);

        // Student
        $student->permissions()->sync([
            $permissionModels['place_order']->id,
            $permissionModels['view_own_orders']->id,
            $permissionModels['browse_menu']->id,
            $permissionModels['view_library']->id,
            $permissionModels['borrow_books']->id,
            $permissionModels['reserve_books']->id,
        ]);

        // Parent
        $parent->permissions()->sync([
            $permissionModels['place_order']->id,
            $permissionModels['view_own_orders']->id,
            $permissionModels['browse_menu']->id,
        ]);
    }
}