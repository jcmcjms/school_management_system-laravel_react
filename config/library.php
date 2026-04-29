<?php

return [
    'borrow_days' => env('LIBRARY_BORROW_DAYS', 7),
    'reservation_days' => env('LIBRARY_RESERVATION_DAYS', 3),
    'max_borrow_limit' => env('LIBRARY_MAX_BORROW_LIMIT', 3),
    'daily_fine' => env('LIBRARY_DAILY_FINE', 1.00),
    'max_reservations' => env('LIBRARY_MAX_RESERVATIONS', 2),
];