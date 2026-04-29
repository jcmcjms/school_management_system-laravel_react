<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class RetailItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'retail_category_id', 'vendor_id', 'name', 'slug', 'description', 'price',
        'image_url', 'available_quantity', 'low_stock_threshold', 'status', 'is_active', 'sort_order', 'vendor_commission'
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'vendor_commission' => 'decimal:2',
            'available_quantity' => 'integer',
            'low_stock_threshold' => 'integer',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function ($item) {
            if (empty($item->slug)) {
                $item->slug = Str::slug($item->name) . '-' . Str::random(4);
            }
            if (empty($item->status)) {
                $item->updateStatus();
            }
        });

        static::updating(function ($item) {
            if ($item->isDirty('available_quantity')) {
                $item->updateStatus();
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(RetailCategory::class, 'retail_category_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }

    public function updateStatus(): void
    {
        if (!$this->is_active || $this->available_quantity <= 0) {
            $this->status = 'out_of_stock';
        } elseif ($this->available_quantity <= $this->low_stock_threshold) {
            $this->status = 'limited';
        } else {
            $this->status = 'available';
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
        $this->updateStatus();
        return true;
    }

    public function incrementStock(int $quantity): void
    {
        $this->available_quantity += $quantity;
        $this->save();
        $this->updateStatus();
    }
}