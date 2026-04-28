<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\SalaryDeduction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FacultyDashboardController extends Controller
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
            ->where('payroll_month', sprintf('%02d', $thisMonth))
            ->where('payroll_year', $thisYear)
            ->get();

        $monthlyTotal = $monthlyDeductions->sum('amount');
        $limit = $user->salary_deduction_limit ?? 0;
        $remaining = $limit - $monthlyTotal;

        $lastThreeMonths = [];
        for ($i = 0; $i < 3; $i++) {
            $month = now()->subMonths($i)->month;
            $year = now()->subMonths($i)->year;

            $deductions = SalaryDeduction::where('user_id', $user->id)
                ->where('payroll_month', sprintf('%02d', $month))
                ->where('payroll_year', $year)
                ->get();

            $lastThreeMonths[] = [
                'month' => now()->subMonths($i)->format('F Y'),
                'total' => $deductions->sum('amount'),
                'orders' => $deductions->count(),
            ];
        }

        $stats = [
            'monthlyLimit' => $limit,
            'monthlyUsed' => $monthlyTotal,
            'monthlyRemaining' => $remaining,
            'totalOrders' => Order::where('user_id', $user->id)->count(),
            'thisMonthOrders' => Order::where('user_id', $user->id)
                ->whereMonth('created_at', $thisMonth)
                ->whereYear('created_at', $thisYear)
                ->count(),
        ];

        return Inertia::render('dashboard/faculty', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'lastThreeMonths' => $lastThreeMonths,
        ]);
    }
}