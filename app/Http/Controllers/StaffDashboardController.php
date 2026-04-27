<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffDashboardController extends Controller
{
    public function index()
    {
        $orders = Order::with(['user', 'items.menuItem'])
            ->whereIn('status', ['pending', 'preparing'])
            ->orderBy('created_at', 'asc')
            ->limit(20)
            ->get();

        $preparingOrders = Order::with(['user', 'items.menuItem'])
            ->where('status', 'preparing')
            ->orderBy('created_at', 'asc')
            ->get();

        $readyOrders = Order::with(['user', 'items.menuItem'])
            ->where('status', 'ready')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $lowStockInventory = InventoryItem::whereRaw('current_quantity <= minimum_quantity')
            ->where('is_active', true)
            ->orderBy('current_quantity', 'asc')
            ->get();

        $statusCounts = [
            'pending' => Order::where('status', 'pending')->count(),
            'preparing' => Order::where('status', 'preparing')->count(),
            'ready' => Order::where('status', 'ready')->count(),
            'served' => Order::where('status', 'served')
                ->whereDate('created_at', now()->toDateString())
                ->count(),
        ];

        return Inertia::render('dashboard/staff', [
            'orders' => $orders,
            'preparingOrders' => $preparingOrders,
            'readyOrders' => $readyOrders,
            'lowStockInventory' => $lowStockInventory,
            'statusCounts' => $statusCounts,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,preparing,ready,served',
        ]);

        $order->update(['status' => $request->status]);

        if ($request->status === 'preparing') {
            foreach ($order->items as $item) {
                $menuItem = $item->menuItem;
                if ($menuItem) {
                    $menuItem->decrementStock($item->quantity);
                }
            }
        }

        if ($request->status === 'served') {
            $order->markAsServed();
        }

        return back()->with('success', 'Order status updated');
    }
}