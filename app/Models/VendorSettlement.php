<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorSettlement extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id', 'settlement_date', 'total_sales', 'items_sold',
        'vendor_share', 'canteen_share', 'items_returned', 'status', 'notes'
    ];

    protected function casts(): array
    {
        return [
            'total_sales' => 'decimal:2',
            'vendor_share' => 'decimal:2',
            'canteen_share' => 'decimal:2',
            'settlement_date' => 'date',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }

    public function markAsCompleted(): void
    {
        $this->update(['status' => 'completed']);
    }
}