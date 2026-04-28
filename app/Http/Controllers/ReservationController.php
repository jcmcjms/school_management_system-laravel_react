<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Order;
use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $reservations = Reservation::with(['menuItem', 'order'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('orders/reservations', [
            'reservations' => $reservations,
        ]);
    }

    /**
     * Staff redeems a reservation by QR code.
     * Triggers inventory auto-deduction.
     */
    public function redeem(Request $request)
    {
        $request->validate([
            'qr_code' => 'required|string',
        ]);

        $reservation = Reservation::with(['order.items.menuItem.ingredients.inventoryItem'])
            ->where('qr_code', $request->qr_code)
            ->first();

        if (!$reservation) {
            return back()->withErrors(['qr_code' => 'Invalid QR code. Reservation not found.']);
        }

        if (!$reservation->canRedeem()) {
            $reason = $reservation->isExpired() ? 'expired' : ($reservation->isRedeemed() ? 'already redeemed' : 'not eligible');
            return back()->withErrors(['qr_code' => "This reservation cannot be redeemed: {$reason}."]);
        }

        // Redeem the reservation
        $reservation->redeem();

        // Auto-deduct inventory from the order items' ingredients
        if ($reservation->order) {
            $this->deductInventoryForOrder($reservation->order, $request->user());
            $reservation->order->markAsServed();
        }

        return back()->with('success', "Reservation {$reservation->qr_code} redeemed successfully.");
    }

    /**
     * Auto-deduct inventory based on menu item ingredient recipes.
     */
    private function deductInventoryForOrder(Order $order, $staffUser): void
    {
        foreach ($order->items as $orderItem) {
            $menuItem = $orderItem->menuItem;
            if (!$menuItem || !$menuItem->ingredients) {
                continue;
            }

            foreach ($menuItem->ingredients as $ingredient) {
                if (!$ingredient->inventory_item_id) {
                    continue;
                }

                $inventoryItem = InventoryItem::find($ingredient->inventory_item_id);
                if (!$inventoryItem) {
                    continue;
                }

                $totalDeduction = $ingredient->quantity_required * $orderItem->quantity;
                $inventoryItem->deductQuantity($totalDeduction, $staffUser, $order);
            }
        }
    }
}
