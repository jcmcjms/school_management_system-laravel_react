<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\SalaryDeduction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $orders = Order::with(['items.menuItem', 'reservation', 'payment'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('orders/index', [
            'orders' => $orders,
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();

        $deductionInfo = null;
        if ($user->isFaculty()) {
            $thisMonth = now()->month;
            $thisYear = now()->year;
            $monthlyUsed = SalaryDeduction::where('user_id', $user->id)
                ->where('payroll_month', sprintf('%02d', $thisMonth))
                ->where('payroll_year', $thisYear)
                ->sum('amount');

            $deductionInfo = [
                'limit' => (float) $user->salary_deduction_limit,
                'used' => (float) $monthlyUsed,
                'remaining' => (float) ($user->salary_deduction_limit - $monthlyUsed),
            ];
        }

        return Inertia::render('orders/create', [
            'deductionInfo' => $deductionInfo,
            'userRole' => $user->role,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.special_instructions' => 'nullable|string|max:255',
            'payment_method' => 'required|in:gcash,cash,salary_deduction',
            'pickup_time' => 'nullable|date_format:H:i',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        // Validate faculty salary deduction limit
        if ($request->payment_method === 'salary_deduction') {
            if (!$user->isFaculty()) {
                return back()->withErrors(['payment_method' => 'Salary deduction is only available for faculty members.']);
            }
        }

        return DB::transaction(function () use ($request, $user) {
            $subtotal = 0;
            $orderItems = [];

            // Validate stock and calculate totals
            foreach ($request->items as $item) {
                $menuItem = MenuItem::findOrFail($item['menu_item_id']);

                if (!$menuItem->isAvailable()) {
                    return back()->withErrors(['items' => "{$menuItem->name} is no longer available."]);
                }

                if ($menuItem->available_quantity < $item['quantity']) {
                    return back()->withErrors(['items' => "Not enough stock for {$menuItem->name}. Only {$menuItem->available_quantity} left."]);
                }

                $itemSubtotal = $menuItem->price * $item['quantity'];
                $subtotal += $itemSubtotal;

                $orderItems[] = [
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $menuItem->price,
                    'subtotal' => $itemSubtotal,
                    'special_instructions' => $item['special_instructions'] ?? null,
                ];
            }

            // Validate salary deduction limit
            if ($request->payment_method === 'salary_deduction') {
                if (!$user->canDeductSalary($subtotal)) {
                    $remaining = $user->getRemainingDeductionLimit();
                    return back()->withErrors([
                        'payment_method' => "Salary deduction limit exceeded. Remaining: ₱" . number_format($remaining, 2) . ". Please choose another payment method.",
                    ]);
                }
            }

            // Create the order
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => Order::generateOrderNumber(),
                'subtotal' => $subtotal,
                'discount' => 0,
                'total' => $subtotal,
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'payment_status' => 'pending',
                'notes' => $request->notes,
            ]);

            // Create order items and decrement stock
            foreach ($orderItems as $item) {
                OrderItem::create(array_merge($item, ['order_id' => $order->id]));

                $menuItem = MenuItem::find($item['menu_item_id']);
                $menuItem->decrementStock($item['quantity']);
            }

            // Process salary deduction immediately
            if ($request->payment_method === 'salary_deduction') {
                $deduction = SalaryDeduction::createFromOrder($order, $user->salary_deduction_limit);

                $user->salary_deduction_current += $order->total;
                $user->save();

                Payment::create([
                    'order_id' => $order->id,
                    'user_id' => $user->id,
                    'amount' => $order->total,
                    'payment_method' => 'salary_deduction',
                    'status' => 'completed',
                    'completed_at' => now(),
                    'notes' => "Salary deduction - Month: {$deduction->payroll_month}/{$deduction->payroll_year}",
                ]);

                $order->markAsPaid();
            }

            // Create reservation if pickup time is set
            if ($request->pickup_time) {
                Reservation::create([
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'menu_item_id' => $orderItems[0]['menu_item_id'],
                    'quantity' => collect($orderItems)->sum('quantity'),
                    'reserved_pickup_time' => $request->pickup_time,
                ]);
            }

            return redirect()->route('orders.show', $order->id)
                ->with('success', 'Order placed successfully!');
        });
    }

    public function show(Request $request, Order $order)
    {
        $user = $request->user();

        // Users can only view their own orders, staff/admin/manager can view any
        if ($order->user_id !== $user->id && !in_array($user->role, ['admin', 'manager', 'staff'])) {
            abort(403);
        }

        $order->load(['items.menuItem', 'reservation', 'payment', 'user']);

        return Inertia::render('orders/show', [
            'order' => $order,
        ]);
    }

    public function cancel(Request $request, Order $order)
    {
        $user = $request->user();

        // Only the order owner can cancel
        if ($order->user_id !== $user->id) {
            abort(403);
        }

        // Can only cancel pending orders that haven't been paid
        if ($order->status !== 'pending') {
            return back()->withErrors(['cancel' => 'Only pending orders can be cancelled.']);
        }

        return DB::transaction(function () use ($order) {
            // Restore stock for each item
            foreach ($order->items as $item) {
                $menuItem = MenuItem::find($item->menu_item_id);
                if ($menuItem) {
                    $menuItem->increment('available_quantity', $item->quantity);
                }
            }

            // Cancel any associated reservation
            if ($order->reservation) {
                $order->reservation->update(['status' => 'cancelled']);
            }

            // Cancel the order
            $order->update([
                'status' => 'cancelled',
                'payment_status' => 'failed',
            ]);

            return back()->with('success', 'Order cancelled successfully. Stock has been restored.');
        });
    }
}
