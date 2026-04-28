<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\SalaryDeduction;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RevenueController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->start_date ? \Carbon\Carbon::parse($request->start_date)->startOfDay() : now()->startOfDay();
        $endDate = $request->end_date ? \Carbon\Carbon::parse($request->end_date)->endOfDay() : now()->endOfDay();

        $orders = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')->get();

        $gcashTotal = $orders->where('payment_method', 'gcash')->sum('total');
        $cashTotal = $orders->where('payment_method', 'cash')->sum('total');
        $deductionTotal = $orders->where('payment_method', 'salary_deduction')->sum('total');

        $recentOrders = Order::with('user')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->orderBy('created_at', 'desc')->limit(20)->get();

        // Faculty near deduction limits
        $facultyUsers = User::where('role', 'faculty')
            ->where('is_active', true)
            ->get()->map(function ($user) {
                $limit = (float) $user->salary_deduction_limit;
                $current = (float) $user->salary_deduction_current;
                $remaining = $limit - $current;
                $percentage = $limit > 0 ? ($current / $limit) * 100 : 0;
                return [
                    'id' => $user->id, 'name' => $user->name,
                    'employee_id' => $user->employee_id, 'department' => $user->department,
                    'limit' => $limit, 'used' => $current,
                    'remaining' => $remaining, 'percentage' => round($percentage, 1),
                    'near_limit' => $percentage >= 90,
                ];
            })->sortByDesc('percentage')->values();

        return Inertia::render('admin/revenue/index', [
            'revenue' => [
                'total' => $gcashTotal + $cashTotal + $deductionTotal,
                'gcash' => $gcashTotal, 'cash' => $cashTotal, 'salary_deduction' => $deductionTotal,
                'order_count' => $orders->count(),
            ],
            'recentOrders' => $recentOrders,
            'facultyDeductions' => $facultyUsers,
            'filters' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
            ],
        ]);
    }

    public function export(Request $request)
    {
        $startDate = $request->start_date ? \Carbon\Carbon::parse($request->start_date)->startOfDay() : now()->startOfMonth();
        $endDate = $request->end_date ? \Carbon\Carbon::parse($request->end_date)->endOfDay() : now()->endOfDay();

        $orders = Order::with(['user', 'items.menuItem'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->orderBy('created_at', 'desc')->get();

        $csv = "Date,Order ID,Customer,Amount,Payment Method,Items\n";
        foreach ($orders as $order) {
            $items = $order->items->map(fn($i) => "{$i->quantity}x {$i->menuItem->name}")->join('; ');
            $csv .= implode(',', [
                $order->created_at->format('Y-m-d H:i'),
                $order->order_number,
                '"' . str_replace('"', '""', $order->user->name) . '"',
                $order->total,
                $order->payment_method,
                '"' . str_replace('"', '""', $items) . '"',
            ]) . "\n";
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=revenue_{$startDate->format('Y-m-d')}_{$endDate->format('Y-m-d')}.csv",
        ]);
    }
}
