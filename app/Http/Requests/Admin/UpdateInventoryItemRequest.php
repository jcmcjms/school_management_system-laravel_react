<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInventoryItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $itemId = $this->route('inventoryItem')?->id;

        return [
            'name' => "required|string|max:255|unique:inventory_items,name,{$itemId}",
            'sku' => "required|string|max:50|unique:inventory_items,sku,{$itemId}",
            'category' => 'required|string|max:100',
            'current_quantity' => 'required|integer|min:0',
            'minimum_quantity' => 'required|integer|min:0',
            'unit' => 'required|string|max:20',
            'unit_cost' => 'nullable|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'low_stock_alert' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}
