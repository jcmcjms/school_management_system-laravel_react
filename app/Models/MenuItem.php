<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'image_url',
        'available_quantity',
        'reserved_quantity',
        'low_stock_threshold',
        'availability_status',
        'allergens',
        'nutritional_info',
        'daily_start_time',
        'daily_end_time',
        'is_available',
        'is_featured',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'available_quantity' => 'integer',
            'reserved_quantity' => 'integer',
            'low_stock_threshold' => 'integer',
            'allergens' => 'array',
            'nutritional_info' => 'array',
            'daily_start_time' => 'datetime:H:i',
            'daily_end_time' => 'datetime:H:i',
            'is_available' => 'boolean',
            'is_featured' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(MenuCategory::class, 'category_id');
    }

    public function ingredients(): HasMany
    {
        return $this->hasMany(MenuItemIngredient::class, 'menu_item_id');
    }

    public function orders(): HasManyThrough
    {
        return $this->hasManyThrough(Order::class, OrderItem::class, 'menu_item_id');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class, 'menu_item_id');
    }

    public function isAvailable(): bool
    {
        return $this->is_available && $this->available_quantity > 0;
    }

    public function isLowStock(): bool
    {
        return $this->available_quantity <= $this->low_stock_threshold && $this->available_quantity > 0;
    }

    public function isSoldOut(): bool
    {
        return $this->available_quantity <= 0;
    }

    public function updateAvailabilityStatus(): void
    {
        if (!$this->is_available) {
            $this->availability_status = 'hidden';
        } elseif ($this->isSoldOut()) {
            $this->availability_status = 'sold_out';
        } elseif ($this->isLowStock()) {
            $this->availability_status = 'limited';
        } else {
            $this->availability_status = 'available';
        }
        $this->save();
    }

    public function decrementStock(int $quantity): bool
    {
        if ($this->available_quantity < $quantity) {
            return false;
        }

        $this->available_quantity -= $quantity;
        $this->save();
        $this->updateAvailabilityStatus();

        return true;
    }

    public function confirmReservation(): void
    {
        $this->updateAvailabilityStatus();
    }
}