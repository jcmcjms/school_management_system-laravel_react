<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\StoreInventoryItemRequest;
use App\Http\Requests\Admin\UpdateInventoryItemRequest;
use App\Http\Requests\Admin\AddInventoryStockRequest;
use App\Models\InventoryItem;
use App\Models\InventoryAlert;
use App\Models\Supplier;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function __construct(
        protected InventoryService $inventoryService
    ) {}

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'category', 'low_stock']);
        $inventoryItems = $this->inventoryService->getAll($filters);
        $categories = InventoryItem::select('category')->distinct()->pluck('category');
        $alerts = InventoryAlert::with('inventoryItem')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('admin/inventory/index', [
            'inventoryItems' => $inventoryItems,
            'categories' => $categories,
            'alerts' => $alerts,
            'suppliers' => $suppliers,
            'filters' => $filters,
        ]);
    }

    public function store(StoreInventoryItemRequest $request)
    {
        try {
            $this->inventoryService->create($request->validated());
            return back()->with('success', 'Inventory item created.');
        } catch (\Throwable $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function update(UpdateInventoryItemRequest $request, InventoryItem $inventoryItem)
    {
        try {
            $this->inventoryService->update($inventoryItem, $request->validated());
            return back()->with('success', 'Inventory item updated.');
        } catch (\Throwable $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function addStock(AddInventoryStockRequest $request, InventoryItem $inventoryItem)
    {
        try {
            $this->inventoryService->addStock(
                $inventoryItem,
                $request->integer('quantity'),
                $request->input('notes')
            );

            if (!$inventoryItem->fresh()->isLowStock()) {
                InventoryAlert::where('inventory_item_id', $inventoryItem->id)
                    ->where('status', 'pending')
                    ->update(['status' => 'resolved']);
            }

            $quantity = $request->integer('quantity');
            return back()->with('success', "Added {$quantity} {$inventoryItem->unit} to {$inventoryItem->name}.");
        } catch (\Throwable $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function acknowledgeAlert(InventoryAlert $alert)
    {
        try {
            $this->inventoryService->acknowledgeAlert($alert);
            return back()->with('success', 'Alert acknowledged.');
        } catch (\Throwable $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
