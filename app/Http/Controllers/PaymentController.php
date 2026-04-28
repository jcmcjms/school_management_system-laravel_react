<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * Staff confirms GCash or Cash payment was received at the counter.
     */
    public function confirmPayment(Request $request, Order $order)
    {
        $request->validate([
            'gcash_reference' => 'nullable|string|max:255',
            'cash_received' => 'nullable|numeric|min:0',
        ]);

        if ($order->payment_status === 'paid') {
            return back()->withErrors(['payment' => 'This order has already been paid.']);
        }

        if (!in_array($order->payment_method, ['gcash', 'cash'])) {
            return back()->withErrors(['payment' => 'This order uses salary deduction and was already processed.']);
        }

        Payment::create([
            'order_id' => $order->id,
            'user_id' => $order->user_id,
            'amount' => $order->total,
            'payment_method' => $order->payment_method,
            'status' => 'completed',
            'gcash_reference' => $request->gcash_reference,
            'completed_at' => now(),
            'notes' => $order->payment_method === 'cash'
                ? "Cash received: ₱" . number_format($request->cash_received ?? $order->total, 2)
                : "GCash confirmed at counter",
        ]);

        if ($order->payment_method === 'cash' && $request->cash_received) {
            $order->update([
                'cash_received' => $request->cash_received,
                'change_given' => max(0, $request->cash_received - $order->total),
            ]);
        }

        if ($request->gcash_reference) {
            $order->update(['gcash_reference' => $request->gcash_reference]);
        }

        $order->markAsPaid();

        return back()->with('success', 'Payment confirmed successfully.');
    }
}
