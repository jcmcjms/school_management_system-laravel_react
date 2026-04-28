<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderCancelled extends Notification
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
            'title' => 'Order Cancelled',
            'message' => "Order {$this->order->order_number} has been cancelled by the customer.",
            'url' => "/staff/dashboard",
            'icon' => 'x-circle',
            'type' => 'order_cancelled',
            'order_number' => $this->order->order_number,
        ];
    }
}
