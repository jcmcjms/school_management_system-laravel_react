<?php

use App\Http\Controllers\MenuController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\StaffDashboardController;
use App\Http\Controllers\FacultyDashboardController;
use App\Http\Controllers\CustomerDashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('login'))->name('home');

Route::get('/menu', [MenuController::class, 'index'])->name('menu');
Route::get('/menu/{menuItem}', [MenuController::class, 'show'])->name('menu.show');

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('admin/dashboard', [AdminDashboardController::class, 'index']);
});

Route::middleware(['auth', 'role:manager'])->group(function () {
    Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('manager/dashboard', [AdminDashboardController::class, 'index']);
});

Route::middleware(['auth', 'role:staff'])->group(function () {
    Route::get('dashboard', [StaffDashboardController::class, 'index'])->name('dashboard');
    Route::get('staff/dashboard', [StaffDashboardController::class, 'index']);
    Route::patch('staff/orders/{order}', [StaffDashboardController::class, 'updateStatus']);
});

Route::middleware(['auth', 'role:faculty'])->group(function () {
    Route::get('dashboard', [FacultyDashboardController::class, 'index'])->name('dashboard');
    Route::get('faculty/dashboard', [FacultyDashboardController::class, 'index']);
});

Route::middleware(['auth', 'role:student,parent'])->group(function () {
    Route::get('dashboard', [CustomerDashboardController::class, 'index'])->name('dashboard');
    Route::get('customer/dashboard', [CustomerDashboardController::class, 'index']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
