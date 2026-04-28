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
            ->with('order:id,order_number,total,status,created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        $monthlyTotal = $monthlyDeductions->sum('amount');
        $limit = $user->salary_deduction_limit ?? 0;
        $remaining = max(0, $limit - $monthlyTotal);

        $lastThreeMonths = [];
        for ($i = 1; $i <= 3; $i++) {
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
            'monthlyLimit' => (float) $limit,
            'monthlyUsed' => (float) $monthlyTotal,
            'monthlyRemaining' => (float) $remaining,
            'totalOrders' => Order::where('user_id', $user->id)->count(),
            'thisMonthOrders' => Order::where('user_id', $user->id)
                ->whereMonth('created_at', $thisMonth)
                ->whereYear('created_at', $thisYear)
                ->count(),
            'currentMonth' => now()->format('F Y'),
        ];

        // Format deduction history for frontend
        $deductionHistory = $monthlyDeductions->map(fn ($d) => [
            'id' => $d->id,
            'amount' => (float) $d->amount,
            'running_total' => (float) $d->running_total,
            'order_number' => $d->order?->order_number,
            'order_status' => $d->order?->status,
            'created_at' => $d->created_at->toISOString(),
            'date' => $d->created_at->format('M d, Y'),
            'time' => $d->created_at->format('g:i A'),
        ]);

        return Inertia::render('dashboard/faculty', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'lastThreeMonths' => $lastThreeMonths,
            'deductionHistory' => $deductionHistory,
        ]);
    }
}