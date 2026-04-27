<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'amount',
        'payment_method',
        'status',
        'gcash_reference',
        'gcash_mobile_number',
        'transaction_id',
        'gcash_response',
        'notes',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'completed_at' => 'datetime',
            'gcash_response' => 'array',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function markAsCompleted(string $reference = null): void
    {
        $this->update([
            'status' => 'completed',
            'gcash_reference' => $reference,
            'completed_at' => now(),
        ]);
    }

    public function markAsFailed(string $notes = null): void
    {
        $this->update([
            'status' => 'failed',
            'notes' => $notes,
        ]);
    }
}