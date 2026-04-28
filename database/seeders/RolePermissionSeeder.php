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
        $admin   = Role::create(['name' => 'admin',   'display_name' => 'Admin',   'description' => 'Full system access',              'is_system' => true]);
        $manager = Role::create(['name' => 'manager', 'display_name' => 'Manager', 'description' => 'Canteen operations manager',      'is_system' => true]);
        $staff   = Role::create(['name' => 'staff',   'display_name' => 'Staff',   'description' => 'Kitchen and counter staff',       'is_system' => true]);
        $faculty = Role::create(['name' => 'faculty', 'display_name' => 'Faculty', 'description' => 'Teaching staff with salary deduction', 'is_system' => true]);
        $student = Role::create(['name' => 'student', 'display_name' => 'Student', 'description' => 'Enrolled student',               'is_system' => true]);
        $parent  = Role::create(['name' => 'parent',  'display_name' => 'Parent',  'description' => 'Student guardian',                'is_system' => true]);

        // ── Create Permissions (grouped) ──────────────────────────────

        // Dashboard
        $viewAdminDash = Permission::create(['name' => 'view_admin_dashboard', 'display_name' => 'View Admin Dashboard', 'group' => 'dashboard']);
        $viewKitchen   = Permission::create(['name' => 'view_kitchen',         'display_name' => 'View Kitchen Dashboard', 'group' => 'dashboard']);

        // Menu Management
        $manageMenu       = Permission::create(['name' => 'manage_menu',       'display_name' => 'Manage Menu Items',  'description' => 'Create, edit, delete menu items', 'group' => 'menu']);
        $manageCategories = Permission::create(['name' => 'manage_categories', 'display_name' => 'Manage Categories',  'description' => 'Create, edit, delete categories', 'group' => 'menu']);

        // User Management
        $manageUsers = Permission::create(['name' => 'manage_users',   'display_name' => 'Manage Users',      'description' => 'Create, edit, delete users',   'group' => 'users']);
        $importUsers = Permission::create(['name' => 'import_users',   'display_name' => 'Import Users (CSV)', 'description' => 'Bulk import users from CSV', 'group' => 'users']);

        // Inventory
        $manageInventory = Permission::create(['name' => 'manage_inventory',   'display_name' => 'Manage Inventory',   'description' => 'Create, edit inventory items',    'group' => 'inventory']);
        $addStock        = Permission::create(['name' => 'add_inventory_stock','display_name' => 'Add Inventory Stock', 'description' => 'Add stock to inventory items',    'group' => 'inventory']);

        // Revenue
        $viewRevenue   = Permission::create(['name' => 'view_revenue',   'display_name' => 'View Revenue Dashboard', 'group' => 'revenue']);
        $exportRevenue = Permission::create(['name' => 'export_revenue', 'display_name' => 'Export Revenue CSV',     'group' => 'revenue']);

        // Faculty Deduction
        $manageDeductions = Permission::create(['name' => 'manage_deduction_limits', 'display_name' => 'Manage Salary Deduction Limits', 'group' => 'faculty']);

        // Kitchen / Staff
        $updateOrderStatus = Permission::create(['name' => 'update_order_status', 'display_name' => 'Update Order Status', 'group' => 'kitchen']);
        $confirmPayment    = Permission::create(['name' => 'confirm_payment',     'display_name' => 'Confirm Payment',     'group' => 'kitchen']);
        $redeemReservation = Permission::create(['name' => 'redeem_reservation',  'display_name' => 'Redeem Reservation QR', 'group' => 'kitchen']);

        // Ordering
        $placeOrder         = Permission::create(['name' => 'place_order',          'display_name' => 'Place Orders',            'group' => 'ordering']);
        $viewOwnOrders      = Permission::create(['name' => 'view_own_orders',      'display_name' => 'View Own Orders',         'group' => 'ordering']);
        $useSalaryDeduction = Permission::create(['name' => 'use_salary_deduction', 'display_name' => 'Pay via Salary Deduction', 'group' => 'ordering']);

        // General
        $browseMenu = Permission::create(['name' => 'browse_menu', 'display_name' => 'Browse Menu', 'group' => 'general']);

        // Roles Management
        $manageRoles = Permission::create(['name' => 'manage_roles', 'display_name' => 'Manage Roles & Permissions', 'group' => 'system']);

        // ── Assign Permissions to Roles ───────────────────────────────

        // Admin gets ALL permissions (also enforced in code via HasPermissions trait)
        $admin->permissions()->attach(Permission::all()->pluck('id'));

        // Manager
        $manager->permissions()->attach([
            $viewAdminDash->id,
            $manageMenu->id,
            $manageCategories->id,
            $manageInventory->id,
            $addStock->id,
            $viewRevenue->id,
            $exportRevenue->id,
            $manageDeductions->id,
            $placeOrder->id,
            $viewOwnOrders->id,
            $browseMenu->id,
        ]);

        // Staff
        $staff->permissions()->attach([
            $viewKitchen->id,
            $updateOrderStatus->id,
            $confirmPayment->id,
            $redeemReservation->id,
            $addStock->id,
            $browseMenu->id,
        ]);

        // Faculty
        $faculty->permissions()->attach([
            $placeOrder->id,
            $viewOwnOrders->id,
            $useSalaryDeduction->id,
            $browseMenu->id,
        ]);

        // Student
        $student->permissions()->attach([
            $placeOrder->id,
            $viewOwnOrders->id,
            $browseMenu->id,
        ]);

        // Parent
        $parent->permissions()->attach([
            $placeOrder->id,
            $viewOwnOrders->id,
            $browseMenu->id,
        ]);
    }
}
