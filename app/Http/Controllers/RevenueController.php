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

        // Employees near deduction limits
        $employeeUsers = User::whereIn('role', ['manager', 'staff', 'faculty'])
            ->where('is_active', true)
            ->where('salary_deduction_limit', '>', 0)
            ->get()->map(function ($user) {
                $thisMonth = now()->month;
                $thisYear = now()->year;
                $limit = (float) $user->salary_deduction_limit;
                $current = (float) SalaryDeduction::where('user_id', $user->id)
                    ->where('payroll_month', sprintf('%02d', $thisMonth))
                    ->where('payroll_year', $thisYear)
                    ->sum('amount');
                $remaining = max(0, $limit - $current);
                $percentage = $limit > 0 ? ($current / $limit) * 100 : 0;
                return [
                    'id' => $user->id, 'name' => $user->name, 'role' => $user->role,
                    'employee_id' => $user->employee_id, 'department' => $user->department,
                    'limit' => $limit, 'used' => $current,
                    'remaining' => $remaining, 'percentage' => round($percentage, 1),
                    'near_limit' => $percentage >= 90,
                ];
            })->sortByDesc('percentage')->values();

        // Top selling items
        $topItems = \DB::table('order_items')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->where('orders.payment_status', 'paid')
            ->select('menu_items.id', 'menu_items.name', \DB::raw('SUM(order_items.quantity) as total_qty'), \DB::raw('SUM(order_items.subtotal) as total_revenue'))
            ->groupBy('menu_items.id', 'menu_items.name')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        // Daily revenue for trend
        $dailyRevenue = \DB::table('orders')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid')
            ->select(\DB::raw('DATE(created_at) as date'), \DB::raw('SUM(total) as daily_total'), \DB::raw('COUNT(*) as order_count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('admin/revenue/index', [
            'revenue' => [
                'total' => $gcashTotal + $cashTotal + $deductionTotal,
                'gcash' => $gcashTotal, 'cash' => $cashTotal, 'salary_deduction' => $deductionTotal,
                'order_count' => $orders->count(),
                'average_order' => $orders->count() > 0 ? ($gcashTotal + $cashTotal + $deductionTotal) / $orders->count() : 0,
            ],
            'recentOrders' => $recentOrders,
            'employeeDeductions' => $employeeUsers,
            'topItems' => $topItems,
            'dailyRevenue' => $dailyRevenue,
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
