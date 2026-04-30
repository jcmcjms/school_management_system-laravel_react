<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'order_number' => $this->order_number,
            'subtotal' => (float) $this->subtotal,
            'discount' => (float) $this->discount,
            'total' => (float) $this->total,
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'gcash_reference' => $this->gcash_reference,
            'notes' => $this->notes,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'served_at' => $this->served_at?->toIso8601String(),
            'user' => $this->whenLoaded('user', fn() => new UserResource($this->user)),
            'items' => $this->whenLoaded('items', fn() => OrderItemResource::collection($this->items)),
            'reservation' => $this->whenLoaded('reservation'),
            'payment' => $this->whenLoaded('payment'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
