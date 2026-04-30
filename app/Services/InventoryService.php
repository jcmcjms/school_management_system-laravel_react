<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\InventoryTransaction;
use App\Models\InventoryAlert;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class InventoryService extends BaseService
{
    protected string $modelClass = InventoryItem::class;

    public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = InventoryItem::query()->with('supplier');

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('sku', 'like', "%{$filters['search']}%");
            });
        }

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (!empty($filters['low_stock'])) {
            $query->whereColumn('current_quantity', '<=', 'minimum_quantity');
        }

        return $query->orderBy('name')->paginate($perPage);
    }

    public function getLowStock(int $limit = 5): Collection
    {
        return InventoryItem::where('current_quantity', '<=', 'minimum_quantity')
            ->where('is_active', true)
            ->where('low_stock_alert', true)
            ->orderBy('current_quantity', 'asc')
            ->limit($limit)
            ->get();
    }

    public function getOutOfStock(): Collection
    {
        return InventoryItem::where('current_quantity', '<=', 0)
            ->where('is_active', true)
            ->get();
    }

    public function create(array $data): InventoryItem
    {
        $validated = $this->validateData($data);

        $item = InventoryItem::create($validated);

        $this->recordTransaction($item, 'addition', $validated['current_quantity'], null, 'Initial stock');

        return $item;
    }

    public function update(InventoryItem $item, array $data): InventoryItem
    {
        $validated = $this->validateData($data, $item);

        $item->update($validated);

        return $item->fresh('supplier');
    }

    public function addStock(InventoryItem $item, int $quantity, ?string $notes = null): InventoryItem
    {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be positive.');
        }

        return DB::transaction(function () use ($item, $quantity, $notes) {
            $before = $item->current_quantity;

            $item->increment('current_quantity', $quantity);

            $this->recordTransaction($item, 'addition', $quantity, $before, $notes);

            $this->checkAndCreateAlert($item);

            return $item->fresh();
        });
    }

    public function deductStock(InventoryItem $item, int $quantity, string $reference, ?string $notes = null): InventoryItem
    {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be positive.');
        }

        if ($item->current_quantity < $quantity) {
            throw new \InvalidArgumentException('Insufficient stock.');
        }

        return DB::transaction(function () use ($item, $quantity, $reference, $notes) {
            $before = $item->current_quantity;

            $item->decrement('current_quantity', $quantity);

            $this->recordTransaction($item, 'deduction', $quantity, $before, $notes, $reference);

            $this->checkAndCreateAlert($item);

            return $item->fresh();
        });
    }

    public function adjustStock(InventoryItem $item, int $newQuantity, ?string $notes = null): InventoryItem
    {
        $quantity = $newQuantity - $item->current_quantity;

        if ($quantity > 0) {
            return $this->addStock($item, $quantity, $notes);
        } elseif ($quantity < 0) {
            return $this->deductStock($item, abs($quantity), 'adjustment', $notes);
        }

        return $item;
    }

    public function recordWastage(InventoryItem $item, int $quantity, ?string $notes = null): InventoryItem
    {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be positive.');
        }

        return DB::transaction(function () use ($item, $quantity, $notes) {
            $before = $item->current_quantity;

            $item->decrement('current_quantity', $quantity);

            $this->recordTransaction($item, 'wastage', $quantity, $before, $notes);

            $this->checkAndCreateAlert($item);

            return $item->fresh();
        });
    }

    public function getTransactions(InventoryItem $item): Collection
    {
        return InventoryTransaction::where('inventory_item_id', $item->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();
    }

    public function acknowledgeAlert(InventoryAlert $alert): InventoryAlert
    {
        $alert->update(['acknowledged_at' => now()]);

        return $alert;
    }

    public function getActiveAlerts(): Collection
    {
        return InventoryAlert::whereNull('acknowledged_at')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    protected function validateData(array $data, ?InventoryItem $item = null): array
    {
        $rules = [
            'name' => 'required|string|max:255' . ($item ? "|unique:inventory_items,name,{$item->id}" : '|unique:inventory_items,name'),
            'sku' => 'required|string|max:50' . ($item ? "|unique:inventory_items,sku,{$item->id}" : '|unique:inventory_items,sku'),
            'category' => 'required|string|max:100',
            'current_quantity' => 'required|integer|min:0',
            'minimum_quantity' => 'required|integer|min:0',
            'unit' => 'required|string|max:20',
            'unit_cost' => 'nullable|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'low_stock_alert' => 'boolean',
            'is_active' => 'boolean',
        ];

        return validator($data, $rules)->validate();
    }

    protected function recordTransaction(
        InventoryItem $item,
        string $type,
        int $quantity,
        ?int $quantityBefore,
        ?string $notes = null,
        ?string $reference = null
    ): InventoryTransaction {
        return InventoryTransaction::create([
            'inventory_item_id' => $item->id,
            'user_id' => auth()->id(),
            'type' => $type,
            'quantity' => $quantity,
            'quantity_before' => $quantityBefore ?? 0,
            'quantity_after' => $quantityBefore ? $quantityBefore + $quantity : $quantity,
            'reference' => $reference,
            'notes' => $notes,
        ]);
    }

    protected function checkAndCreateAlert(InventoryItem $item): void
    {
        if ($item->current_quantity <= $item->minimum_quantity && $item->low_stock_alert) {
            InventoryAlert::updateOrCreate(
                ['inventory_item_id' => $item->id, 'acknowledged_at' => null],
                ['alert_type' => 'low_stock', 'message' => "Low stock: {$item->name}"]
            );
        } else {
            InventoryAlert::where('inventory_item_id', $item->id)
                ->whereNull('acknowledged_at')
                ->where('alert_type', 'low_stock')
                ->delete();
        }
    }
}
