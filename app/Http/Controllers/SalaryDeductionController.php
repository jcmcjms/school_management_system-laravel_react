<?php

namespace App\Http\Controllers;

use App\Models\SalaryDeduction;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalaryDeductionController extends Controller
{
    /**
     * Salary deduction monitoring dashboard for admin/manager.
     */
    public function index(Request $request)
    {
        $thisMonth = now()->month;
        $thisYear = now()->year;

        // Get all employees with salary deduction limits
        $employees = User::whereIn('role', ['manager', 'staff', 'faculty'])
            ->where('salary_deduction_limit', '>', 0)
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($user) use ($thisMonth, $thisYear) {
                $monthlyUsed = SalaryDeduction::where('user_id', $user->id)
                    ->where('payroll_month', sprintf('%02d', $thisMonth))
                    ->where('payroll_year', $thisYear)
                    ->sum('amount');

                $transactionCount = SalaryDeduction::where('user_id', $user->id)
                    ->where('payroll_month', sprintf('%02d', $thisMonth))
                    ->where('payroll_year', $thisYear)
                    ->count();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'employee_id' => $user->employee_id,
                    'department' => $user->department,
                    'position' => $user->position,
                    'limit' => (float) $user->salary_deduction_limit,
                    'used' => (float) $monthlyUsed,
                    'remaining' => (float) max(0, $user->salary_deduction_limit - $monthlyUsed),
                    'usage_percent' => $user->salary_deduction_limit > 0
                        ? round(($monthlyUsed / $user->salary_deduction_limit) * 100, 1)
                        : 0,
                    'transaction_count' => $transactionCount,
                ];
            });

        // Summary stats
        $totalLimit = $employees->sum('limit');
        $totalUsed = $employees->sum('used');
        $totalRemaining = $employees->sum('remaining');
        $employeesAtLimit = $employees->where('usage_percent', '>=', 100)->count();

        // Recent deduction transactions (all employees)
        $recentDeductions = SalaryDeduction::with(['user:id,name,role,employee_id', 'order:id,order_number,total,status'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'user_name' => $d->user->name ?? 'Unknown',
                'user_role' => $d->user->role ?? '',
                'employee_id' => $d->user->employee_id ?? '',
                'order_number' => $d->order->order_number ?? '-',
                'amount' => (float) $d->amount,
                'payroll_month' => $d->payroll_month,
                'payroll_year' => $d->payroll_year,
                'created_at' => $d->created_at->toISOString(),
                'date' => $d->created_at->format('M d, Y'),
                'time' => $d->created_at->format('g:i A'),
            ]);

        return Inertia::render('admin/salary-deductions/index', [
            'employees' => $employees,
            'recentDeductions' => $recentDeductions,
            'summary' => [
                'totalEmployees' => $employees->count(),
                'totalLimit' => $totalLimit,
                'totalUsed' => $totalUsed,
                'totalRemaining' => $totalRemaining,
                'employeesAtLimit' => $employeesAtLimit,
            ],
            'currentMonth' => now()->format('F Y'),
        ]);
    }

    /**
     * Update an employee's salary deduction limit.
     */
    public function updateLimit(Request $request, User $user)
    {
        $request->validate([
            'salary_deduction_limit' => 'required|numeric|min:0|max:99999',
        ]);

        $user->update([
            'salary_deduction_limit' => $request->salary_deduction_limit,
        ]);

        return back()->with('success', "Deduction limit for {$user->name} updated to ₱" . number_format($request->salary_deduction_limit, 2));
    }

    /**
     * View deductions for a specific employee.
     */
    public function show(Request $request, User $user)
    {
        $deductions = SalaryDeduction::with(['order:id,order_number,total,status,created_at'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $thisMonth = now()->month;
        $thisYear = now()->year;

        $monthlyUsed = SalaryDeduction::where('user_id', $user->id)
            ->where('payroll_month', sprintf('%02d', $thisMonth))
            ->where('payroll_year', $thisYear)
            ->sum('amount');

        // Last 6 months breakdown
        $monthlyBreakdown = [];
        for ($i = 0; $i < 6; $i++) {
            $date = now()->subMonths($i);
            $month = sprintf('%02d', $date->month);
            $year = $date->year;

            $total = SalaryDeduction::where('user_id', $user->id)
                ->where('payroll_month', $month)
                ->where('payroll_year', $year)
                ->sum('amount');

            $monthlyBreakdown[] = [
                'label' => $date->format('M Y'),
                'total' => (float) $total,
            ];
        }

        return Inertia::render('admin/salary-deductions/show', [
            'employee' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'employee_id' => $user->employee_id,
                'department' => $user->department,
                'position' => $user->position,
                'limit' => (float) $user->salary_deduction_limit,
                'used' => (float) $monthlyUsed,
                'remaining' => (float) max(0, $user->salary_deduction_limit - $monthlyUsed),
            ],
            'deductions' => $deductions,
            'monthlyBreakdown' => $monthlyBreakdown,
            'currentMonth' => now()->format('F Y'),
        ]);
    }
}
