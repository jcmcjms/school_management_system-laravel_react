<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PaymentConfirmed extends Notification
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
        $method = ucfirst(str_replace('_', ' ', $this->order->payment_method ?? 'cash'));

        return [
            'title' => 'Payment Confirmed',
            'message' => "Payment of ₱" . number_format($this->order->total, 2) . " for {$this->order->order_number} confirmed via {$method}.",
            'url' => "/orders/{$this->order->id}",
            'icon' => 'credit-card',
            'type' => 'payment',
            'order_number' => $this->order->order_number,
        ];
    }
}
