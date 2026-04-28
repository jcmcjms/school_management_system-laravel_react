<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderStatusChanged extends Notification
{
    use Queueable;

    public function __construct(
        protected Order $order,
        protected string $newStatus
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $messages = [
            'confirmed' => "Your order {$this->order->order_number} has been confirmed!",
            'preparing' => "Your order {$this->order->order_number} is now being prepared!",
            'ready' => "Your order {$this->order->order_number} is ready for pickup!",
            'served' => "Your order {$this->order->order_number} has been served. Enjoy!",
        ];

        $icons = [
            'confirmed' => 'check-circle',
            'preparing' => 'chef-hat',
            'ready' => 'bell-ring',
            'served' => 'utensils-crossed',
        ];

        return [
            'title' => 'Order ' . ucfirst($this->newStatus),
            'message' => $messages[$this->newStatus] ?? "Your order status changed to {$this->newStatus}.",
            'url' => "/orders/{$this->order->id}",
            'icon' => $icons[$this->newStatus] ?? 'package',
            'type' => 'order_status',
            'order_number' => $this->order->order_number,
            'status' => $this->newStatus,
        ];
    }
}
