<?php

use App\Http\Controllers\MenuController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\StaffDashboardController;
use App\Http\Controllers\FacultyDashboardController;
use App\Http\Controllers\CustomerDashboardController;
use App\Http\Controllers\RedirectController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('login'))->name('home');

Route::get('/menu', [MenuController::class, 'index'])->name('menu');
Route::get('/menu/{menuItem}', [MenuController::class, 'show'])->name('menu.show');

// Single smart dashboard entry-point: redirects each role to their specific dashboard.
// This is also where Laravel's built-in guest middleware redirects authenticated users.
Route::middleware('auth')->get('dashboard', [RedirectController::class, 'index'])->name('dashboard');

Route::middleware(['auth', 'role:admin,manager'])->group(function () {
    Route::get('admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
});

Route::middleware(['auth', 'role:staff'])->group(function () {
    Route::get('staff/dashboard', [StaffDashboardController::class, 'index'])->name('staff.dashboard');
    Route::patch('staff/orders/{order}', [StaffDashboardController::class, 'updateStatus']);
});

Route::middleware(['auth', 'role:faculty'])->group(function () {
    Route::get('faculty/dashboard', [FacultyDashboardController::class, 'index'])->name('faculty.dashboard');
});

Route::middleware(['auth', 'role:student,parent'])->group(function () {
    Route::get('customer/dashboard', [CustomerDashboardController::class, 'index'])->name('customer.dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
