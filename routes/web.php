<?php

use App\Http\Controllers\MenuController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\StaffDashboardController;
use App\Http\Controllers\FacultyDashboardController;
use App\Http\Controllers\CustomerDashboardController;
use App\Http\Controllers\RedirectController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::get('/menu', [MenuController::class, 'index'])->name('menu');
Route::get('/menu/{menuItem}', [MenuController::class, 'show'])->name('menu.show');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [RedirectController::class, 'index'])->name('dashboard');

    Route::get('admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard')->middleware('role:admin');

    Route::get('manager/dashboard', [AdminDashboardController::class, 'index'])->name('manager.dashboard')->middleware('role:manager');

    Route::get('staff/dashboard', [StaffDashboardController::class, 'index'])->name('staff.dashboard')->middleware('role:staff');
    Route::patch('staff/orders/{order}', [StaffDashboardController::class, 'updateStatus'])->name('staff.orders.update')->middleware('role:staff');

    Route::get('faculty/dashboard', [FacultyDashboardController::class, 'index'])->name('faculty.dashboard')->middleware('role:faculty');

    Route::get('customer/dashboard', [CustomerDashboardController::class, 'index'])->name('customer.dashboard')->middleware('role:student,parent');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
