<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $itemId = $this->route('menuItem')?->id;

        return [
            'category_id' => 'required|exists:menu_categories,id',
            'name' => "required|string|max:255|unique:menu_items,name,{$itemId}",
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|max:2048',
            'available_quantity' => 'nullable|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'allergens' => 'nullable|array',
            'nutritional_info' => 'nullable|array',
            'daily_start_time' => 'nullable|date_format:H:i',
            'daily_end_time' => 'nullable|date_format:H:i|after:daily_start_time',
            'is_available' => 'boolean',
            'is_featured' => 'boolean',
            'sort_order' => 'nullable|integer',
        ];
    }
}
