<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryReservation extends Model
{
    use HasFactory;

    protected $fillable = ['book_id', 'user_id', 'reserved_at', 'expires_at', 'fulfilled_at', 'status'];

    protected function casts(): array
    {
        return [
            'reserved_at' => 'datetime',
            'expires_at' => 'datetime',
            'fulfilled_at' => 'datetime',
        ];
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(LibraryBook::class, 'book_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function isExpired(): bool
    {
        return $this->status === 'pending' && $this->expires_at->isPast();
    }

    public function cancel(): void
    {
        $this->update(['status' => 'cancelled']);
    }

    public function fulfill(): void
    {
        $this->update([
            'fulfilled_at' => now(),
            'status' => 'fulfilled',
        ]);
    }
}