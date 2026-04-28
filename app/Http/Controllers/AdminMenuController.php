<?php

namespace App\Http\Controllers;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\MenuItemIngredient;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminMenuController extends Controller
{
    public function index(Request $request)
    {
        $query = MenuItem::with('category');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        $menuItems = $query->orderBy('sort_order')->orderBy('name')->paginate(20);
        $categories = MenuCategory::orderBy('sort_order')->get();

        return Inertia::render('admin/menu/index', [
            'menuItems' => $menuItems,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    public function create()
    {
        $categories = MenuCategory::where('is_active', true)->orderBy('sort_order')->get();
        $inventoryItems = InventoryItem::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('admin/menu/form', [
            'categories' => $categories,
            'inventoryItems' => $inventoryItems,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:menu_categories,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
            'available_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'integer|min:0',
            'allergens' => 'nullable|array',
            'allergens.*' => 'string',
            'nutritional_info' => 'nullable|array',
            'daily_start_time' => 'nullable|date_format:H:i',
            'daily_end_time' => 'nullable|date_format:H:i',
            'is_available' => 'boolean',
            'is_featured' => 'boolean',
            'ingredients' => 'nullable|array',
            'ingredients.*.inventory_item_id' => 'nullable|exists:inventory_items,id',
            'ingredients.*.ingredient_name' => 'required|string|max:255',
            'ingredients.*.quantity_required' => 'required|numeric|min:0',
            'ingredients.*.unit' => 'required|string|max:50',
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $imageUrl = '/storage/' . $request->file('image')->store('menu-items', 'public');
        }

        $menuItem = MenuItem::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . Str::random(4),
            'category_id' => $validated['category_id'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'image_url' => $imageUrl,
            'available_quantity' => $validated['available_quantity'],
            'low_stock_threshold' => $validated['low_stock_threshold'] ?? 5,
            'allergens' => $validated['allergens'] ?? null,
            'nutritional_info' => $validated['nutritional_info'] ?? null,
            'daily_start_time' => $validated['daily_start_time'] ?? null,
            'daily_end_time' => $validated['daily_end_time'] ?? null,
            'is_available' => $validated['is_available'] ?? true,
            'is_featured' => $validated['is_featured'] ?? false,
        ]);

        $menuItem->updateAvailabilityStatus();

        // Create ingredient links
        if (!empty($validated['ingredients'])) {
            foreach ($validated['ingredients'] as $ingredient) {
                MenuItemIngredient::create([
                    'menu_item_id' => $menuItem->id,
                    'inventory_item_id' => $ingredient['inventory_item_id'] ?? null,
                    'ingredient_name' => $ingredient['ingredient_name'],
                    'quantity_required' => $ingredient['quantity_required'],
                    'unit' => $ingredient['unit'],
                ]);
            }
        }

        return redirect()->route('admin.menu.index')
            ->with('success', "Menu item '{$menuItem->name}' created successfully.");
    }

    public function edit(MenuItem $menuItem)
    {
        $menuItem->load('ingredients');
        $categories = MenuCategory::where('is_active', true)->orderBy('sort_order')->get();
        $inventoryItems = InventoryItem::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('admin/menu/form', [
            'menuItem' => $menuItem,
            'categories' => $categories,
            'inventoryItems' => $inventoryItems,
        ]);
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:menu_categories,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
            'available_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'integer|min:0',
            'allergens' => 'nullable|array',
            'allergens.*' => 'string',
            'nutritional_info' => 'nullable|array',
            'daily_start_time' => 'nullable|date_format:H:i',
            'daily_end_time' => 'nullable|date_format:H:i',
            'is_available' => 'boolean',
            'is_featured' => 'boolean',
            'ingredients' => 'nullable|array',
            'ingredients.*.inventory_item_id' => 'nullable|exists:inventory_items,id',
            'ingredients.*.ingredient_name' => 'required|string|max:255',
            'ingredients.*.quantity_required' => 'required|numeric|min:0',
            'ingredients.*.unit' => 'required|string|max:50',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'category_id' => $validated['category_id'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'available_quantity' => $validated['available_quantity'],
            'low_stock_threshold' => $validated['low_stock_threshold'] ?? 5,
            'allergens' => $validated['allergens'] ?? null,
            'nutritional_info' => $validated['nutritional_info'] ?? null,
            'daily_start_time' => $validated['daily_start_time'] ?? null,
            'daily_end_time' => $validated['daily_end_time'] ?? null,
            'is_available' => $validated['is_available'] ?? true,
            'is_featured' => $validated['is_featured'] ?? false,
        ];

        if ($request->hasFile('image')) {
            // Delete old image if it was uploaded (not external URL)
            if ($menuItem->image_url && str_starts_with($menuItem->image_url, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $menuItem->image_url));
            }
            $updateData['image_url'] = '/storage/' . $request->file('image')->store('menu-items', 'public');
        }

        $menuItem->update($updateData);

        $menuItem->updateAvailabilityStatus();

        // Sync ingredients
        $menuItem->ingredients()->delete();
        if (!empty($validated['ingredients'])) {
            foreach ($validated['ingredients'] as $ingredient) {
                MenuItemIngredient::create([
                    'menu_item_id' => $menuItem->id,
                    'inventory_item_id' => $ingredient['inventory_item_id'] ?? null,
                    'ingredient_name' => $ingredient['ingredient_name'],
                    'quantity_required' => $ingredient['quantity_required'],
                    'unit' => $ingredient['unit'],
                ]);
            }
        }

        return redirect()->route('admin.menu.index')
            ->with('success', "Menu item '{$menuItem->name}' updated successfully.");
    }

    public function destroy(MenuItem $menuItem)
    {
        $name = $menuItem->name;
        $menuItem->delete();

        return redirect()->route('admin.menu.index')
            ->with('success', "Menu item '{$name}' deleted.");
    }

    public function toggleAvailability(MenuItem $menuItem)
    {
        $menuItem->update(['is_available' => !$menuItem->is_available]);
        $menuItem->updateAvailabilityStatus();

        return back()->with('success', $menuItem->is_available ? 'Item is now available.' : 'Item has been hidden.');
    }

    // Category management
    public function categories()
    {
        $categories = MenuCategory::withCount('menuItems')->orderBy('sort_order')->get();

        return Inertia::render('admin/menu/categories', [
            'categories' => $categories,
        ]);
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'sort_order' => 'integer|min:0',
        ]);

        MenuCategory::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => true,
        ]);

        return back()->with('success', 'Category created.');
    }

    public function updateCategory(Request $request, MenuCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean',
        ]);

        $category->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Category updated.');
    }

    public function destroyCategory(MenuCategory $category)
    {
        if ($category->menuItems()->count() > 0) {
            return back()->withErrors(['category' => 'Cannot delete category with menu items. Move or delete items first.']);
        }

        $category->delete();
        return back()->with('success', 'Category deleted.');
    }
}
