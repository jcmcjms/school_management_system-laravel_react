<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\InventoryItem;
use App\Models\Payment;
use App\Notifications\OrderStatusChanged;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffDashboardController extends Controller
{
    public function index()
    {
        $pendingOrders = Order::with(['user', 'items.menuItem', 'payment'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->get();

        $preparingOrders = Order::with(['user', 'items.menuItem', 'payment'])
            ->where('status', 'preparing')
            ->orderBy('created_at', 'asc')
            ->get();

        $readyOrders = Order::with(['user', 'items.menuItem', 'payment'])
            ->where('status', 'ready')
            ->orderBy('created_at', 'desc')
            ->limit(15)
            ->get();

        $servedToday = Order::with(['user', 'items.menuItem', 'payment'])
            ->where('status', 'served')
            ->whereDate('created_at', now()->toDateString())
            ->orderBy('served_at', 'desc')
            ->limit(20)
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
            'cancelled' => Order::where('status', 'cancelled')
                ->whereDate('created_at', now()->toDateString())
                ->count(),
        ];

        $todayRevenue = Order::where('payment_status', 'paid')
            ->whereDate('created_at', now()->toDateString())
            ->sum('total');

        return Inertia::render('dashboard/staff', [
            'pendingOrders' => $pendingOrders,
            'preparingOrders' => $preparingOrders,
            'readyOrders' => $readyOrders,
            'servedToday' => $servedToday,
            'lowStockInventory' => $lowStockInventory,
            'statusCounts' => $statusCounts,
            'todayRevenue' => (float) $todayRevenue,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,preparing,ready,served',
        ]);

        $oldStatus = $order->status;
        $newStatus = $request->status;

        // Validate valid transitions
        $validTransitions = [
            'pending' => ['preparing'],
            'preparing' => ['ready'],
            'ready' => ['served'],
        ];

        if (!isset($validTransitions[$oldStatus]) || !in_array($newStatus, $validTransitions[$oldStatus])) {
            return back()->withErrors(['status' => "Cannot change status from {$oldStatus} to {$newStatus}."]);
        }

        $order->update(['status' => $newStatus]);

        if ($newStatus === 'served') {
            $order->markAsServed();

            // Auto-confirm payment when served (cash collected at counter, gcash verified)
            if ($order->payment_status !== 'paid') {
                // Create a payment record if one doesn't exist
                if (!$order->payment && in_array($order->payment_method, ['cash', 'gcash'])) {
                    Payment::create([
                        'order_id' => $order->id,
                        'user_id' => $order->user_id,
                        'amount' => $order->total,
                        'payment_method' => $order->payment_method,
                        'status' => 'completed',
                        'completed_at' => now(),
                        'notes' => 'Auto-confirmed on serve',
                    ]);
                }
                $order->markAsPaid();
            }
        }

        // Notify the customer about the status change
        $order->load('user');
        if ($order->user) {
            $order->user->notify(new OrderStatusChanged($order, $newStatus));
        }

        return back()->with('success', 'Order status updated');
    }
}