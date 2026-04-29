<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Reservation;
use App\Models\SalaryDeduction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $recentOrders = Order::with(['items.menuItem'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $thisMonth = now()->month;
        $thisYear = now()->year;

        $monthlyDeductions = SalaryDeduction::where('user_id', $user->id)
            ->where('payroll_month', $thisMonth)
            ->where('payroll_year', $thisYear)
            ->get();

        $monthlyTotal = $monthlyDeductions->sum('amount');

        $limit = $user->salary_deduction_limit ?? 0;
        $remaining = $limit - $monthlyTotal;

        $activeReservations = Reservation::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->count();

        $stats = [
            'monthlyLimit' => $limit,
            'monthlyUsed' => $monthlyTotal,
            'monthlyRemaining' => $remaining,
            'totalOrders' => Order::where('user_id', $user->id)->count(),
            'thisMonthOrders' => Order::where('user_id', $user->id)
                ->whereMonth('created_at', $thisMonth)
                ->whereYear('created_at', $thisYear)
                ->count(),
            'activeReservations' => $activeReservations,
        ];

        return Inertia::render('dashboard/customer', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
        ]);
    }
}