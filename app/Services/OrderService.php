<?php

namespace App\Services;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class OrderService extends BaseService
{
    protected string $modelClass = Order::class;

    public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Order::with(['user', 'items.menuItem']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getRecent(int $limit = 10): Collection
    {
        return Order::with(['user', 'items.menuItem'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getByUser(User $user, array $filters = []): LengthAwarePaginator
    {
        return Order::where('user_id', $user->id)
            ->with(['items.menuItem', 'payment'])
            ->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            $order = Order::create([
                'user_id' => $data['user_id'],
                'order_number' => $this->generateOrderNumber(),
                'subtotal' => 0,
                'discount' => 0,
                'total' => 0,
                'status' => 'pending',
                'payment_method' => $data['payment_method'] ?? null,
                'payment_status' => 'pending',
                'notes' => $data['notes'] ?? null,
            ]);

            $total = 0;

            foreach ($data['items'] as $itemData) {
                $menuItem = MenuItem::findOrFail($itemData['menu_item_id']);

                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $menuItem->price,
                    'subtotal' => $menuItem->price * $itemData['quantity'],
                    'special_instructions' => $itemData['special_instructions'] ?? null,
                ]);

                $total += $orderItem->subtotal;

                $menuItem->decrement('available_quantity', $itemData['quantity']);
            }

            $order->update([
                'subtotal' => $total,
                'total' => $total,
            ]);

            return $order->load(['user', 'items.menuItem']);
        });
    }

    public function updateStatus(Order $order, string $status): Order
    {
        $validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled', 'refunded'];

        if (!in_array($status, $validStatuses)) {
            throw new \InvalidArgumentException("Invalid status: {$status}");
        }

        if ($order->status === 'cancelled' || $order->status === 'refunded') {
            throw new \InvalidArgumentException('Cannot update a cancelled or refunded order.');
        }

        $updateData = ['status' => $status];

        if ($status === 'served') {
            $updateData['served_at'] = now();
        }

        $order->update($updateData);

        return $order->fresh(['user', 'items.menuItem']);
    }

    public function cancel(Order $order): Order
    {
        if ($order->status !== 'pending') {
            throw new \InvalidArgumentException('Only pending orders can be cancelled.');
        }

        DB::transaction(function () use ($order) {
            foreach ($order->items as $item) {
                MenuItem::where('id', $item->menu_item_id)
                    ->increment('available_quantity', $item->quantity);
            }

            $order->update(['status' => 'cancelled']);
        });

        return $order->fresh(['user', 'items.menuItem']);
    }

    public function confirmPayment(Order $order, string $method, ?string $reference = null): Order
    {
        if ($order->payment_status === 'paid') {
            throw new \InvalidArgumentException('Order is already paid.');
        }

        $updateData = [
            'payment_status' => 'paid',
            'payment_method' => $method,
            'paid_at' => now(),
        ];

        if ($reference) {
            $updateData['gcash_reference'] = $reference;
        }

        $order->update($updateData);

        return $order->fresh(['user', 'items.menuItem', 'payment']);
    }

    public function getTodayOrders(): Collection
    {
        return Order::whereDate('created_at', today())->get();
    }

    public function getTodayRevenue(): float
    {
        return Order::whereDate('created_at', today())
            ->where('payment_status', 'paid')
            ->sum('total');
    }

    public function getStatusCounts(): array
    {
        return [
            'pending' => Order::where('status', 'pending')->count(),
            'confirmed' => Order::where('status', 'confirmed')->count(),
            'preparing' => Order::where('status', 'preparing')->count(),
            'ready' => Order::where('status', 'ready')->count(),
            'served' => Order::where('status', 'served')->count(),
        ];
    }

    protected function generateOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $lastOrder = Order::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastOrder ? (int) substr($lastOrder->order_number, -4) + 1 : 1;

        return "ORD-{$date}-" . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}
