<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'category',
        'current_quantity',
        'minimum_quantity',
        'unit',
        'unit_cost',
        'supplier_id',
        'low_stock_alert',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'current_quantity' => 'decimal:3',
            'minimum_quantity' => 'decimal:3',
            'unit_cost' => 'decimal:2',
            'low_stock_alert' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class, 'inventory_item_id');
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(InventoryAlert::class, 'inventory_item_id');
    }

    public function isLowStock(): bool
    {
        return $this->low_stock_alert && $this->current_quantity <= $this->minimum_quantity;
    }

    public function isOutOfStock(): bool
    {
        return $this->current_quantity <= 0;
    }

    public function addQuantity(float $quantity, User $user, string $type = 'addition', string $reference = null, string $notes = null): InventoryTransaction
    {
        $before = $this->current_quantity;
        $this->current_quantity += $quantity;
        $this->save();

        return InventoryTransaction::create([
            'inventory_item_id' => $this->id,
            'user_id' => $user->id,
            'type' => $type,
            'quantity' => $quantity,
            'quantity_before' => $before,
            'quantity_after' => $this->current_quantity,
            'reference' => $reference,
            'notes' => $notes,
        ]);
    }

    public function deductQuantity(float $quantity, User $user, ?Order $order = null): ?InventoryTransaction
    {
        if ($this->current_quantity < $quantity) {
            return null;
        }

        $before = $this->current_quantity;
        $this->current_quantity -= $quantity;
        $this->save();

        return InventoryTransaction::create([
            'inventory_item_id' => $this->id,
            'user_id' => $user->id,
            'type' => 'deduction',
            'quantity' => $quantity,
            'quantity_before' => $before,
            'quantity_after' => $this->current_quantity,
            'reference' => $order?->order_number,
            'notes' => 'Order deduction',
        ]);
    }
}