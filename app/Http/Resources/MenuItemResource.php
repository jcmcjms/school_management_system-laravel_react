<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => (float) $this->price,
            'image_url' => $this->image_url,
            'available_quantity' => $this->available_quantity,
            'reserved_quantity' => $this->reserved_quantity,
            'low_stock_threshold' => $this->low_stock_threshold,
            'availability_status' => $this->availability_status,
            'allergens' => $this->allergens,
            'nutritional_info' => $this->nutritional_info,
            'daily_start_time' => $this->daily_start_time,
            'daily_end_time' => $this->daily_end_time,
            'is_available' => $this->is_available,
            'is_featured' => $this->is_featured,
            'sort_order' => $this->sort_order,
            'category' => $this->whenLoaded('category', fn() => new MenuCategoryResource($this->category)),
            'ingredients' => $this->whenLoaded('ingredients'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
