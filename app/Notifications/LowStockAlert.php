<?php

namespace App\Notifications;

use App\Models\InventoryItem;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LowStockAlert extends Notification
{
    use Queueable;

    public function __construct(
        protected InventoryItem $item
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'title' => 'Low Stock Alert',
            'message' => "{$this->item->name} is running low — {$this->item->current_quantity} {$this->item->unit} remaining (min: {$this->item->minimum_quantity}).",
            'url' => '/admin/inventory',
            'icon' => 'alert-triangle',
            'type' => 'low_stock',
            'item_name' => $this->item->name,
        ];
    }
}
