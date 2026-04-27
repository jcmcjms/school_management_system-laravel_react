<?php

use App\Http\Controllers\MenuController;
use App\Http\Controllers\RedirectController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/menu', [MenuController::class, 'index'])->name('menu');
Route::get('/menu/{menuItem}', [MenuController::class, 'show'])->name('menu.show');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [RedirectController::class, 'index'])->name('dashboard');

    Route::get('admin/dashboard', function () {
        return Inertia::render('dashboard/admin');
    })->name('admin.dashboard')->middleware('role:admin,manager');

    Route::get('manager/dashboard', function () {
        return Inertia::render('dashboard/admin');
    })->name('manager.dashboard')->middleware('role:manager');

    Route::get('staff/dashboard', function () {
        return Inertia::render('dashboard/staff');
    })->name('staff.dashboard')->middleware('role:staff');

    Route::get('faculty/dashboard', function () {
        return Inertia::render('dashboard/faculty');
    })->name('faculty.dashboard')->middleware('role:faculty');

    Route::get('customer/dashboard', function () {
        return Inertia::render('dashboard/customer');
    })->name('customer.dashboard')->middleware('role:student,parent');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
