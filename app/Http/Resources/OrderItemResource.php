<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'menu_item_id' => $this->menu_item_id,
            'quantity' => $this->quantity,
            'unit_price' => (float) $this->unit_price,
            'subtotal' => (float) $this->subtotal,
            'special_instructions' => $this->special_instructions,
            'menuItem' => $this->whenLoaded('menuItem', fn() => new MenuItemResource($this->menuItem)),
            'menu_item' => $this->whenLoaded('menuItem', fn() => new MenuItemResource($this->menuItem)),
        ];
    }
}
