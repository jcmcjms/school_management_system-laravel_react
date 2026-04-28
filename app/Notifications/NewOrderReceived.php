<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewOrderReceived extends Notification
{
    use Queueable;

    public function __construct(
        protected Order $order
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'title' => 'New Order',
            'message' => "New order {$this->order->order_number} from {$this->order->user->name} — ₱" . number_format($this->order->total, 2),
            'url' => "/staff/dashboard",
            'icon' => 'shopping-cart',
            'type' => 'new_order',
            'order_number' => $this->order->order_number,
        ];
    }
}
