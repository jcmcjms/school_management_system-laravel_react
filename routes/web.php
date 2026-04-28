<?php

use App\Http\Controllers\MenuController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminMenuController;
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
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('login'))->name('home');

Route::get('/menu', [MenuController::class, 'index'])->name('menu');
Route::get('/menu/{menuItem}', [MenuController::class, 'show'])->name('menu.show');

// Single smart dashboard entry-point: redirects each role to their specific dashboard.
// This is also where Laravel's built-in guest middleware redirects authenticated users.
Route::middleware('auth')->get('dashboard', [RedirectController::class, 'index'])->name('dashboard');

// ── Admin / Manager Routes ──────────────────────────────────────────
Route::middleware(['auth', 'role:admin,manager'])->group(function () {
    Route::get('admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    // Menu Management
    Route::get('admin/menu', [AdminMenuController::class, 'index'])->name('admin.menu.index');
    Route::get('admin/menu/create', [AdminMenuController::class, 'create'])->name('admin.menu.create');
    Route::post('admin/menu', [AdminMenuController::class, 'store'])->name('admin.menu.store');
    Route::get('admin/menu/{menuItem}/edit', [AdminMenuController::class, 'edit'])->name('admin.menu.edit');
    Route::put('admin/menu/{menuItem}', [AdminMenuController::class, 'update'])->name('admin.menu.update');
    Route::delete('admin/menu/{menuItem}', [AdminMenuController::class, 'destroy'])->name('admin.menu.destroy');
    Route::patch('admin/menu/{menuItem}/toggle', [AdminMenuController::class, 'toggleAvailability'])->name('admin.menu.toggle');

    // Category Management
    Route::get('admin/categories', [AdminMenuController::class, 'categories'])->name('admin.categories.index');
    Route::post('admin/categories', [AdminMenuController::class, 'storeCategory'])->name('admin.categories.store');
    Route::put('admin/categories/{category}', [AdminMenuController::class, 'updateCategory'])->name('admin.categories.update');
    Route::delete('admin/categories/{category}', [AdminMenuController::class, 'destroyCategory'])->name('admin.categories.destroy');

    // User Management
    Route::get('admin/users', [AdminUserController::class, 'index'])->name('admin.users.index');
    Route::post('admin/users', [AdminUserController::class, 'store'])->name('admin.users.store');
    Route::put('admin/users/{user}', [AdminUserController::class, 'update'])->name('admin.users.update');
    Route::delete('admin/users/{user}', [AdminUserController::class, 'destroy'])->name('admin.users.destroy');
    Route::post('admin/users/import', [AdminUserController::class, 'importCsv'])->name('admin.users.import');
    Route::patch('admin/users/{user}/deduction-limit', [AdminUserController::class, 'updateDeductionLimit'])->name('admin.users.deduction-limit');

    // Inventory Management
    Route::get('admin/inventory', [InventoryController::class, 'index'])->name('admin.inventory.index');
    Route::post('admin/inventory', [InventoryController::class, 'store'])->name('admin.inventory.store');
    Route::put('admin/inventory/{inventoryItem}', [InventoryController::class, 'update'])->name('admin.inventory.update');
    Route::post('admin/inventory/{inventoryItem}/add-stock', [InventoryController::class, 'addStock'])->name('admin.inventory.add-stock');
    Route::patch('admin/inventory/alerts/{alert}/acknowledge', [InventoryController::class, 'acknowledgeAlert'])->name('admin.inventory.acknowledge-alert');

    // Revenue Dashboard
    Route::get('admin/revenue', [RevenueController::class, 'index'])->name('admin.revenue.index');
    Route::get('admin/revenue/export', [RevenueController::class, 'export'])->name('admin.revenue.export');
});

// ── Staff Routes ────────────────────────────────────────────────────
Route::middleware(['auth', 'role:staff'])->group(function () {
    Route::get('staff/dashboard', [StaffDashboardController::class, 'index'])->name('staff.dashboard');
    Route::patch('staff/orders/{order}/status', [StaffDashboardController::class, 'updateStatus'])->name('staff.orders.update-status');
    Route::post('staff/orders/{order}/confirm-payment', [PaymentController::class, 'confirmPayment'])->name('staff.orders.confirm-payment');
    Route::post('staff/reservations/redeem', [ReservationController::class, 'redeem'])->name('staff.reservations.redeem');
});

// ── Faculty Routes ──────────────────────────────────────────────────
Route::middleware(['auth', 'role:faculty'])->group(function () {
    Route::get('faculty/dashboard', [FacultyDashboardController::class, 'index'])->name('faculty.dashboard');
});

// ── Customer (Student + Parent) Routes ──────────────────────────────
Route::middleware(['auth', 'role:student,parent'])->group(function () {
    Route::get('customer/dashboard', [CustomerDashboardController::class, 'index'])->name('customer.dashboard');
});

// ── Shared Authenticated Routes (all roles can order) ───────────────
Route::middleware('auth')->group(function () {
    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('orders/create', [OrderController::class, 'create'])->name('orders.create');
    Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::get('reservations', [ReservationController::class, 'index'])->name('reservations.index');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
