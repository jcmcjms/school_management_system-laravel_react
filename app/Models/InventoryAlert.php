<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_item_id',
        'alert_type',
        'status',
        'notes',
        'acknowledged_at',
    ];

    protected function casts(): array
    {
        return [
            'acknowledged_at' => 'datetime',
        ];
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    public static function createForLowStock(InventoryItem $item): self
    {
        return static::create([
            'inventory_item_id' => $item->id,
            'alert_type' => 'low_stock',
            'status' => 'pending',
        ]);
    }

    public static function createForOutOfStock(InventoryItem $item): self
    {
        return static::create([
            'inventory_item_id' => $item->id,
            'alert_type' => 'out_of_stock',
            'status' => 'pending',
        ]);
    }

    public function acknowledge(): void
    {
        $this->update([
            'status' => 'acknowledged',
            'acknowledged_at' => now(),
        ]);
    }

    public function resolve(): void
    {
        $this->update(['status' => 'resolved']);
    }
}