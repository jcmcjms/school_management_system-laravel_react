<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_id',
        'menu_item_id',
        'quantity',
        'qr_code',
        'qr_code_expires_at',
        'reserved_pickup_time',
        'status',
        'redeemed_at',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'qr_code_expires_at' => 'datetime',
            'reserved_pickup_time' => 'datetime:H:i',
            'redeemed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Reservation $reservation) {
            if (empty($reservation->qr_code)) {
                $reservation->qr_code = 'RES-' . strtoupper(Str::random(16));
            }
            if (empty($reservation->qr_code_expires_at)) {
                $reservation->qr_code_expires_at = now()->addHours(2);
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id');
    }

    public function isExpired(): bool
    {
        return $this->qr_code_expires_at->isPast();
    }

    public function isRedeemed(): bool
    {
        return $this->status === 'redeemed';
    }

    public function canRedeem(): bool
    {
        return !$this->isExpired() && !$this->isRedeemed() && in_array($this->status, ['pending', 'confirmed']);
    }

    public function redeem(): bool
    {
        if (!$this->canRedeem()) {
            return false;
        }

        $this->update([
            'status' => 'redeemed',
            'redeemed_at' => now(),
        ]);

        return true;
    }

    public function cancel(): void
    {
        $this->update(['status' => 'cancelled']);
    }
}