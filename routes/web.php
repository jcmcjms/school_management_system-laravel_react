<?php

use App\Http\Controllers\MenuController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminMenuController;
use App\Http\Controllers\AdminRetailController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\StaffDashboardController;
use App\Http\Controllers\FacultyDashboardController;
use App\Http\Controllers\CustomerDashboardController;
use App\Http\Controllers\RedirectController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\RevenueController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\SalaryDeductionController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('login'))->name('home');

Route::get('/menu', [MenuController::class, 'index'])->name('menu');
Route::get('/menu/{menuItem}', [MenuController::class, 'show'])->name('menu.show');

// Single smart dashboard entry-point: redirects each role to their specific dashboard.
Route::middleware('auth')->get('dashboard', [RedirectController::class, 'index'])->name('dashboard');

// ── Notifications ───────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('api/notifications/poll', [NotificationController::class, 'poll'])->name('notifications.poll');
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.mark-all-read');
});

// ── Chat ────────────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::get('chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('chat/{conversation}', [ChatController::class, 'show'])->name('chat.show');
    Route::post('chat/start/{user}', [ChatController::class, 'startConversation'])->name('chat.start');
    Route::post('chat/{conversation}/messages', [ChatController::class, 'sendMessage'])->name('chat.send');
    Route::get('api/chat/{conversation}/poll', [ChatController::class, 'pollMessages'])->name('chat.poll-messages');
    Route::get('api/chat/poll', [ChatController::class, 'pollConversations'])->name('chat.poll-conversations');
    Route::post('chat/{conversation}/read', [ChatController::class, 'markRead'])->name('chat.mark-read');
    Route::get('api/chat/users', [ChatController::class, 'searchUsers'])->name('chat.search-users');
});

// ── Admin Dashboard (permission-gated) ──────────────────────────────
Route::middleware(['auth', 'permission:view_admin_dashboard'])->group(function () {
    Route::get('admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
});

// ── Menu Management ─────────────────────────────────────────────────
Route::middleware(['auth', 'permission:manage_menu'])->group(function () {
    Route::get('admin/menu', [AdminMenuController::class, 'index'])->name('admin.menu.index');
    Route::get('admin/menu/create', [AdminMenuController::class, 'create'])->name('admin.menu.create');
    Route::post('admin/menu', [AdminMenuController::class, 'store'])->name('admin.menu.store');
    Route::get('admin/menu/{menuItem}/edit', [AdminMenuController::class, 'edit'])->name('admin.menu.edit');
    Route::put('admin/menu/{menuItem}', [AdminMenuController::class, 'update'])->name('admin.menu.update');
    Route::delete('admin/menu/{menuItem}', [AdminMenuController::class, 'destroy'])->name('admin.menu.destroy');
    Route::patch('admin/menu/{menuItem}/toggle', [AdminMenuController::class, 'toggleAvailability'])->name('admin.menu.toggle');
    Route::get('admin/menu/export', [AdminMenuController::class, 'export'])->name('admin.menu.export');
    Route::post('admin/menu/import', [AdminMenuController::class, 'import'])->name('admin.menu.import');
});

// ── Category Management ─────────────────────────────────────────────
Route::middleware(['auth', 'permission:manage_categories'])->group(function () {
    Route::get('admin/categories', [AdminMenuController::class, 'categories'])->name('admin.categories.index');
    Route::post('admin/categories', [AdminMenuController::class, 'storeCategory'])->name('admin.categories.store');
    Route::put('admin/categories/{category}', [AdminMenuController::class, 'updateCategory'])->name('admin.categories.update');
    Route::delete('admin/categories/{category}', [AdminMenuController::class, 'destroyCategory'])->name('admin.categories.destroy');
});

// ── User Management ─────────────────────────────────────────────────
Route::middleware(['auth', 'permission:manage_users'])->group(function () {
    Route::get('admin/users', [AdminUserController::class, 'index'])->name('admin.users.index');
    Route::post('admin/users', [AdminUserController::class, 'store'])->name('admin.users.store');
    Route::put('admin/users/{user}', [AdminUserController::class, 'update'])->name('admin.users.update');
    Route::delete('admin/users/{user}', [AdminUserController::class, 'destroy'])->name('admin.users.destroy');
    Route::patch('admin/users/{user}/deduction-limit', [AdminUserController::class, 'updateDeductionLimit'])->name('admin.users.deduction-limit');
});

Route::middleware(['auth', 'permission:import_users'])->group(function () {
    Route::post('admin/users/import', [AdminUserController::class, 'importCsv'])->name('admin.users.import');
});

// ── Inventory Management ────────────────────────────────────────────
Route::middleware(['auth', 'permission:manage_inventory'])->group(function () {
    Route::get('admin/inventory', [InventoryController::class, 'index'])->name('admin.inventory.index');
    Route::post('admin/inventory', [InventoryController::class, 'store'])->name('admin.inventory.store');
    Route::put('admin/inventory/{inventoryItem}', [InventoryController::class, 'update'])->name('admin.inventory.update');
    Route::patch('admin/inventory/alerts/{alert}/acknowledge', [InventoryController::class, 'acknowledgeAlert'])->name('admin.inventory.acknowledge-alert');
});

Route::middleware(['auth', 'permission:add_inventory_stock'])->group(function () {
    Route::post('admin/inventory/{inventoryItem}/add-stock', [InventoryController::class, 'addStock'])->name('admin.inventory.add-stock');
});

// ── Revenue Dashboard ───────────────────────────────────────────────
Route::middleware(['auth', 'permission:view_revenue'])->group(function () {
    Route::get('admin/revenue', [RevenueController::class, 'index'])->name('admin.revenue.index');
});

Route::middleware(['auth', 'permission:export_revenue'])->group(function () {
    Route::get('admin/revenue/export', [RevenueController::class, 'export'])->name('admin.revenue.export');
});

// ── Retail & Vendor Management ───────────────────────────────────────
Route::middleware(['auth', 'permission:manage_menu'])->group(function () {
    // Retail Categories
    Route::get('admin/retail/categories', [AdminRetailController::class, 'categories'])->name('admin.retail.categories');
    Route::post('admin/retail/categories', [AdminRetailController::class, 'storeCategory'])->name('admin.retail.categories.store');
    Route::put('admin/retail/categories/{category}', [AdminRetailController::class, 'updateCategory'])->name('admin.retail.categories.update');
    Route::delete('admin/retail/categories/{category}', [AdminRetailController::class, 'destroyCategory'])->name('admin.retail.categories.destroy');

    // Retail Items
    Route::get('admin/retail/items', [AdminRetailController::class, 'items'])->name('admin.retail.items');
    Route::get('admin/retail/items/create', [AdminRetailController::class, 'createItem'])->name('admin.retail.items.create');
    Route::post('admin/retail/items', [AdminRetailController::class, 'storeItem'])->name('admin.retail.items.store');
    Route::get('admin/retail/items/{item}/edit', [AdminRetailController::class, 'editItem'])->name('admin.retail.items.edit');
    Route::put('admin/retail/items/{item}', [AdminRetailController::class, 'updateItem'])->name('admin.retail.items.update');
    Route::delete('admin/retail/items/{item}', [AdminRetailController::class, 'destroyItem'])->name('admin.retail.items.destroy');
    Route::patch('admin/retail/items/{item}/stock', [AdminRetailController::class, 'adjustStock'])->name('admin.retail.items.stock');

    // Vendors
    Route::get('admin/retail/vendors', [AdminRetailController::class, 'vendors'])->name('admin.retail.vendors');
    Route::post('admin/retail/vendors', [AdminRetailController::class, 'storeVendor'])->name('admin.retail.vendors.store');
    Route::put('admin/retail/vendors/{vendor}', [AdminRetailController::class, 'updateVendor'])->name('admin.retail.vendors.update');
    Route::delete('admin/retail/vendors/{vendor}', [AdminRetailController::class, 'destroyVendor'])->name('admin.retail.vendors.destroy');

    // Vendor Products
    Route::get('admin/retail/vendor-products', [AdminRetailController::class, 'vendorProducts'])->name('admin.retail.vendor-products');
    Route::get('admin/retail/vendor-products/create', [AdminRetailController::class, 'createVendorProduct'])->name('admin.retail.vendor-products.create');
    Route::post('admin/retail/vendor-products', [AdminRetailController::class, 'storeVendorProduct'])->name('admin.retail.vendor-products.store');
    Route::put('admin/retail/vendor-products/{product}', [AdminRetailController::class, 'updateVendorProduct'])->name('admin.retail.vendor-products.update');
    Route::delete('admin/retail/vendor-products/{product}', [AdminRetailController::class, 'destroyVendorProduct'])->name('admin.retail.vendor-products.destroy');

    // Quick Sell
    Route::get('admin/retail/quick-sell', [AdminRetailController::class, 'quickSell'])->name('admin.retail.quick-sell');

    // Vendor Settlements
    Route::get('admin/retail/settlements', [AdminRetailController::class, 'settlements'])->name('admin.retail.settlements');
    Route::post('admin/retail/settlements', [AdminRetailController::class, 'createSettlement'])->name('admin.retail.settlements.create');
    Route::post('admin/retail/vendor-sales', [AdminRetailController::class, 'recordVendorSale'])->name('admin.retail.vendor-sales.record');
});

// ── Roles & Permissions Management ──────────────────────────────────
Route::middleware(['auth', 'permission:manage_roles'])->group(function () {
    Route::get('admin/roles', [RolePermissionController::class, 'index'])->name('admin.roles.index');
    Route::put('admin/roles/{role}/permissions', [RolePermissionController::class, 'updatePermissions'])->name('admin.roles.update-permissions');
});

// ── Salary Deduction Monitoring ─────────────────────────────────────
Route::middleware(['auth', 'permission:manage_deduction_limits'])->group(function () {
    Route::get('admin/salary-deductions', [SalaryDeductionController::class, 'index'])->name('admin.salary-deductions.index');
    Route::get('admin/salary-deductions/{user}', [SalaryDeductionController::class, 'show'])->name('admin.salary-deductions.show');
    Route::patch('admin/salary-deductions/{user}/limit', [SalaryDeductionController::class, 'updateLimit'])->name('admin.salary-deductions.update-limit');
});

// ── Staff / Kitchen Routes ──────────────────────────────────────────
Route::middleware(['auth', 'permission:view_kitchen'])->group(function () {
    Route::get('staff/dashboard', [StaffDashboardController::class, 'index'])->name('staff.dashboard');
});

Route::middleware(['auth', 'permission:update_order_status'])->group(function () {
    Route::patch('staff/orders/{order}/status', [StaffDashboardController::class, 'updateStatus'])->name('staff.orders.update-status');
});

Route::middleware(['auth', 'permission:confirm_payment'])->group(function () {
    Route::post('staff/orders/{order}/confirm-payment', [PaymentController::class, 'confirmPayment'])->name('staff.orders.confirm-payment');
});

Route::middleware(['auth', 'permission:redeem_reservation'])->group(function () {
    Route::post('staff/reservations/redeem', [ReservationController::class, 'redeem'])->name('staff.reservations.redeem');
});

// ── Faculty Dashboard (role-based — dashboard routing) ──────────────
Route::middleware(['auth', 'role:faculty'])->group(function () {
    Route::get('faculty/dashboard', [FacultyDashboardController::class, 'index'])->name('faculty.dashboard');
});

// ── Customer Dashboard (role-based — dashboard routing) ─────────────
Route::middleware(['auth', 'role:student,parent'])->group(function () {
    Route::get('customer/dashboard', [CustomerDashboardController::class, 'index'])->name('customer.dashboard');
});

// ── Shared Authenticated Routes (permission-gated) ──────────────────
Route::middleware(['auth', 'permission:place_order'])->group(function () {
    Route::get('orders/create', [OrderController::class, 'create'])->name('orders.create');
    Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
});

Route::middleware(['auth', 'permission:view_own_orders'])->group(function () {
    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::patch('orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    Route::get('reservations', [ReservationController::class, 'index'])->name('reservations.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

