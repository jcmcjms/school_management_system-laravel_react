<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalaryDeduction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_id',
        'amount',
        'running_total',
        'monthly_limit',
        'payroll_month',
        'payroll_year',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'running_total' => 'decimal:2',
            'monthly_limit' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public static function createFromOrder(Order $order, float $monthlyLimit): self
    {
        $user = $order->user;
        $runningTotal = $user->salary_deduction_current + $order->total;

        return static::create([
            'user_id' => $user->id,
            'order_id' => $order->id,
            'amount' => $order->total,
            'running_total' => $runningTotal,
            'monthly_limit' => $monthlyLimit,
            'payroll_month' => now()->format('m'),
            'payroll_year' => now()->format('Y'),
        ]);
    }
}