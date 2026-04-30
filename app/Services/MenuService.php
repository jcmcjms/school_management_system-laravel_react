<?php

namespace App\Services;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\MenuItemIngredient;
use App\Models\InventoryItem;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MenuService extends BaseService
{
    protected string $modelClass = MenuItem::class;

    public function getCategories(): Collection
    {
        return MenuCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
    }

    public function getAllCategories(): Collection
    {
        return MenuCategory::withCount('menuItems')
            ->orderBy('sort_order')
            ->get();
    }

    public function getCategoryWithItems(int $categoryId): ?MenuCategory
    {
        return MenuCategory::with(['menuItems' => function ($query) {
            $query->where('is_available', true)->orderBy('sort_order');
        }])->find($categoryId);
    }

    public function getAllItems(array $filters = []): LengthAwarePaginator
    {
        $query = MenuItem::with('category');

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['is_available'])) {
            $query->where('is_available', $filters['is_available']);
        }

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('description', 'like', "%{$filters['search']}%");
            });
        }

        return $query->orderBy('sort_order')->paginate($filters['per_page'] ?? 15);
    }

    public function getAvailableItems(): Collection
    {
        return MenuItem::with('category')
            ->where('is_available', true)
            ->where('available_quantity', '>', 0)
            ->orderBy('sort_order')
            ->get();
    }

    public function getFeaturedItems(int $limit = 6): Collection
    {
        return MenuItem::with('category')
            ->where('is_available', true)
            ->where('is_featured', true)
            ->where('available_quantity', '>', 0)
            ->limit($limit)
            ->get();
    }

    public function getLowStockItems(int $threshold = 5, int $limit = 5): Collection
    {
        return MenuItem::where('available_quantity', '<=', $threshold)
            ->where('available_quantity', '>', 0)
            ->orderBy('available_quantity', 'asc')
            ->limit($limit)
            ->get();
    }

    public function getItemForEdit(MenuItem $item): MenuItem
    {
        return $item->load('ingredients');
    }

    public function getCategoriesForSelect(): Collection
    {
        return MenuCategory::where('is_active', true)->orderBy('sort_order')->get();
    }

    public function getInventoryItemsForSelect(): Collection
    {
        return InventoryItem::where('is_active', true)->orderBy('name')->get();
    }

    public function createItem(array $data): MenuItem
    {
        $validated = $this->validateItemData($data);

        $imageUrl = null;
        if (!empty($data['image'])) {
            $imageUrl = $this->storeImage($data['image']);
        }

        $menuItem = MenuItem::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . Str::random(4),
            'category_id' => $validated['category_id'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'image_url' => $imageUrl,
            'available_quantity' => $validated['available_quantity'] ?? 0,
            'low_stock_threshold' => $validated['low_stock_threshold'] ?? 5,
            'allergens' => $validated['allergens'] ?? null,
            'nutritional_info' => $validated['nutritional_info'] ?? null,
            'daily_start_time' => $validated['daily_start_time'] ?? null,
            'daily_end_time' => $validated['daily_end_time'] ?? null,
            'is_available' => $validated['is_available'] ?? true,
            'is_featured' => $validated['is_featured'] ?? false,
        ]);

        $menuItem->updateAvailabilityStatus();

        if (!empty($validated['ingredients'])) {
            $this->syncIngredients($menuItem, $validated['ingredients']);
        }

        return $menuItem;
    }

    public function updateItem(MenuItem $item, array $data): MenuItem
    {
        $validated = $this->validateItemData($data, $item);

        $updateData = [
            'name' => $validated['name'],
            'category_id' => $validated['category_id'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'available_quantity' => $validated['available_quantity'] ?? 0,
            'low_stock_threshold' => $validated['low_stock_threshold'] ?? 5,
            'allergens' => $validated['allergens'] ?? null,
            'nutritional_info' => $validated['nutritional_info'] ?? null,
            'daily_start_time' => $validated['daily_start_time'] ?? null,
            'daily_end_time' => $validated['daily_end_time'] ?? null,
            'is_available' => $validated['is_available'] ?? true,
            'is_featured' => $validated['is_featured'] ?? false,
        ];

        if (!empty($data['image'])) {
            if ($item->image_url && str_starts_with($item->image_url, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $item->image_url));
            }
            $updateData['image_url'] = $this->storeImage($data['image']);
        }

        $item->update($updateData);
        $item->updateAvailabilityStatus();

        if (isset($validated['ingredients'])) {
            $this->syncIngredients($item, $validated['ingredients']);
        }

        return $item->fresh('category', 'ingredients');
    }

    public function deleteItem(MenuItem $item): bool
    {
        if ($item->image_url) {
            $path = str_starts_with($item->image_url, '/storage/')
                ? str_replace('/storage/', '', $item->image_url)
                : $item->image_url;
            Storage::disk('public')->delete($path);
        }

        return $item->delete();
    }

    public function toggleAvailability(MenuItem $item): MenuItem
    {
        $item->update(['is_available' => !$item->is_available]);
        $item->updateAvailabilityStatus();

        return $item;
    }

    public function createCategory(array $data): MenuCategory
    {
        $validated = validator($data, [
            'name' => 'required|string|max:255|unique:menu_categories,name',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ])->validate();

        return MenuCategory::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);
    }

    public function updateCategory(MenuCategory $category, array $data): MenuCategory
    {
        $validated = validator($data, [
            'name' => 'required|string|max:255|unique:menu_categories,name,' . $category->id,
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'boolean',
        ])->validate();

        $category->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return $category;
    }

    public function deleteCategory(MenuCategory $category): bool
    {
        if ($category->menuItems()->count() > 0) {
            throw new \InvalidArgumentException('Cannot delete category with menu items.');
        }

        return $category->delete();
    }

    protected function validateItemData(array $data, ?MenuItem $item = null): array
    {
        $rules = [
            'category_id' => 'required|exists:menu_categories,id',
            'name' => 'required|string|max:255' . ($item ? "|unique:menu_items,name,{$item->id}" : '|unique:menu_items,name'),
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
            'ingredients' => 'nullable|array',
            'ingredients.*.inventory_item_id' => 'nullable|exists:inventory_items,id',
            'ingredients.*.ingredient_name' => 'required|string|max:255',
            'ingredients.*.quantity_required' => 'required|numeric|min:0',
            'ingredients.*.unit' => 'required|string|max:50',
        ];

        $dataToValidate = $data;
        unset($dataToValidate['image']);

        return validator($dataToValidate, $rules)->validate();
    }

    protected function storeImage($image): string
    {
        return $image->store('menu-items', 'public');
    }

    protected function syncIngredients(MenuItem $item, array $ingredients): void
    {
        $item->ingredients()->delete();

        foreach ($ingredients as $ingredient) {
            MenuItemIngredient::create([
                'menu_item_id' => $item->id,
                'inventory_item_id' => $ingredient['inventory_item_id'] ?? null,
                'ingredient_name' => $ingredient['ingredient_name'],
                'quantity_required' => $ingredient['quantity_required'],
                'unit' => $ingredient['unit'],
            ]);
        }
    }
}
