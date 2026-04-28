<?php

namespace App\Notifications;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ReservationRedeemed extends Notification
{
    use Queueable;

    public function __construct(
        protected Reservation $reservation
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $orderNumber = $this->reservation->order?->order_number ?? 'N/A';

        return [
            'title' => 'Reservation Redeemed',
            'message' => "Your reservation for order {$orderNumber} has been redeemed at the counter.",
            'url' => $this->reservation->order ? "/orders/{$this->reservation->order_id}" : '/reservations',
            'icon' => 'qr-code',
            'type' => 'reservation',
            'order_number' => $orderNumber,
        ];
    }
}
