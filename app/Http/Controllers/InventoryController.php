<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryAlert;
use App\Models\InventoryTransaction;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryItem::with('supplier');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('sku', 'like', "%{$request->search}%");
            });
        }

        if ($request->category) {
            $query->where('category', $request->category);
        }

        if ($request->low_stock) {
            $query->whereRaw('current_quantity <= minimum_quantity');
        }

        $inventoryItems = $query->orderBy('name')->paginate(20);
        $categories = InventoryItem::select('category')->distinct()->pluck('category');
        $alerts = InventoryAlert::with('inventoryItem')
            ->where('status', 'pending')->orderBy('created_at', 'desc')->limit(10)->get();
        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('admin/inventory/index', [
            'inventoryItems' => $inventoryItems,
            'categories' => $categories,
            'alerts' => $alerts,
            'suppliers' => $suppliers,
            'filters' => $request->only(['search', 'category', 'low_stock']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:50|unique:inventory_items,sku',
            'category' => 'required|string|max:255',
            'current_quantity' => 'required|numeric|min:0',
            'minimum_quantity' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'unit_cost' => 'nullable|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'low_stock_alert' => 'boolean',
        ]);
        InventoryItem::create($validated);
        return back()->with('success', 'Inventory item created.');
    }

    public function update(Request $request, InventoryItem $inventoryItem)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => "required|string|max:50|unique:inventory_items,sku,{$inventoryItem->id}",
            'category' => 'required|string|max:255',
            'minimum_quantity' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'unit_cost' => 'nullable|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'low_stock_alert' => 'boolean',
            'is_active' => 'boolean',
        ]);
        $inventoryItem->update($validated);
        return back()->with('success', 'Inventory item updated.');
    }

    public function addStock(Request $request, InventoryItem $inventoryItem)
    {
        $request->validate([
            'quantity' => 'required|numeric|min:0.001',
            'notes' => 'nullable|string|max:500',
        ]);
        $inventoryItem->addQuantity(
            $request->quantity, $request->user(), 'addition', null,
            $request->notes ?? 'Manual stock addition'
        );
        if (!$inventoryItem->isLowStock()) {
            InventoryAlert::where('inventory_item_id', $inventoryItem->id)
                ->where('status', 'pending')->update(['status' => 'resolved']);
        }
        return back()->with('success', "Added {$request->quantity} {$inventoryItem->unit} to {$inventoryItem->name}.");
    }

    public function acknowledgeAlert(InventoryAlert $alert)
    {
        $alert->update(['status' => 'acknowledged', 'acknowledged_at' => now()]);
        return back()->with('success', 'Alert acknowledged.');
    }
}
