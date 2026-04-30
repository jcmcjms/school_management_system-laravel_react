<?php

namespace App\Http\Controllers;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Services\MenuService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminMenuController extends Controller
{
    public function __construct(
        protected MenuService $menuService
    ) {}

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'category_id']);
        $menuItems = $this->menuService->getAllItems($filters);
        $categories = $this->menuService->getCategories();

        return Inertia::render('admin/menu/index', [
            'menuItems' => $menuItems,
            'categories' => $categories,
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/menu/form', [
            'categories' => $this->menuService->getCategoriesForSelect(),
            'inventoryItems' => $this->menuService->getInventoryItemsForSelect(),
        ]);
    }

    public function store(Request $request)
    {
        try {
            $menuItem = $this->menuService->createItem($request->all());
            return redirect()->route('admin.menu.index')
                ->with('success', "Menu item '{$menuItem->name}' created successfully.");
        } catch (\Throwable $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function edit(MenuItem $menuItem)
    {
        $menuItem = $this->menuService->getItemForEdit($menuItem);

        return Inertia::render('admin/menu/form', [
            'menuItem' => $menuItem,
            'categories' => $this->menuService->getCategoriesForSelect(),
            'inventoryItems' => $this->menuService->getInventoryItemsForSelect(),
        ]);
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        try {
            $menuItem = $this->menuService->updateItem($menuItem, $request->all());
            return redirect()->route('admin.menu.index')
                ->with('success', "Menu item '{$menuItem->name}' updated successfully.");
        } catch (\Throwable $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(MenuItem $menuItem)
    {
        try {
            $name = $menuItem->name;
            $this->menuService->deleteItem($menuItem);
            return redirect()->route('admin.menu.index')
                ->with('success', "Menu item '{$name}' deleted.");
        } catch (\Throwable $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function toggleAvailability(MenuItem $menuItem)
    {
        try {
            $menuItem = $this->menuService->toggleAvailability($menuItem);
            return back()->with('success', $menuItem->is_available ? 'Item is now available.' : 'Item has been hidden.');
        } catch (\Throwable $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function categories()
    {
        $categories = $this->menuService->getAllCategories();

        return Inertia::render('admin/menu/categories', [
            'categories' => $categories,
        ]);
    }

    public function storeCategory(Request $request)
    {
        try {
            $this->menuService->createCategory($request->all());
            return back()->with('success', 'Category created.');
        } catch (\Throwable $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function updateCategory(Request $request, MenuCategory $category)
    {
        try {
            $this->menuService->updateCategory($category, $request->all());
            return back()->with('success', 'Category updated.');
        } catch (\Throwable $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroyCategory(MenuCategory $category)
    {
        try {
            $this->menuService->deleteCategory($category);
            return back()->with('success', 'Category deleted.');
        } catch (\Throwable $e) {
            return back()->withErrors(['category' => $e->getMessage()]);
        }
    }

    public function export()
    {
        $items = $this->menuService->getAllItems(['per_page' => 1000]);

        $headers = ['Name', 'Category', 'Price', 'Stock', 'Low Stock Threshold', 'Status', 'Available', 'Description', 'Allergens'];

        $rows = $items->map(function ($item) {
            return [
                $item->name,
                $item->category?->name ?? '',
                $item->price,
                $item->available_quantity,
                $item->low_stock_threshold,
                $item->availability_status,
                $item->is_available ? 'Yes' : 'No',
                $item->description,
                is_array($item->allergens) ? implode(', ', $item->allergens) : '',
            ];
        });

        $csvContent = implode(",", $headers) . "\n";
        foreach ($rows as $row) {
            $csvContent .= implode(",", array_map(function ($cell) {
                return '"' . str_replace('"', '""', $cell) . '"';
            }, $row)) . "\n";
        }

        $filename = 'menu-items-' . date('Y-m-d') . '.csv';

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        $header = fgetcsv($handle);

        $rowCount = 0;
        $errorRows = [];

        while (($row = fgetcsv($handle)) !== false) {
            $data = array_combine($header, $row);

            try {
                $categoryName = trim($data['Category'] ?? '');
                $categoryId = null;

                if ($categoryName) {
                    $category = MenuCategory::where('name', $categoryName)->first();
                    if ($category) {
                        $categoryId = $category->id;
                    } else {
                        $category = MenuCategory::create([
                            'name' => $categoryName,
                            'slug' => \Illuminate\Support\Str::slug($categoryName),
                            'is_active' => true,
                        ]);
                        $categoryId = $category->id;
                    }
                }

                $allergens = [];
                if (!empty($data['Allergens'])) {
                    $allergens = array_map('trim', explode(',', $data['Allergens']));
                }

                MenuItem::create([
                    'name' => trim($data['Name'] ?? 'Unnamed Item'),
                    'slug' => \Illuminate\Support\Str::slug($data['Name'] ?? 'unnamed') . '-' . \Illuminate\Support\Str::random(4),
                    'category_id' => $categoryId,
                    'description' => trim($data['Description'] ?? null),
                    'price' => floatval($data['Price'] ?? 0),
                    'available_quantity' => intval($data['Stock'] ?? 0),
                    'low_stock_threshold' => intval($data['Low Stock Threshold'] ?? 5),
                    'is_available' => strtolower(trim($data['Available'] ?? 'yes')) === 'yes',
                    'allergens' => $allergens,
                    'availability_status' => 'available',
                ]);

                $rowCount++;
            } catch (\Exception $e) {
                $errorRows[] = $rowCount + 1;
            }
        }

        fclose($handle);

        if (empty($errorRows)) {
            return back()->with('success', "Successfully imported {$rowCount} menu items.");
        }

        return back()->with('warning', "Imported {$rowCount} items. Failed on rows: " . implode(', ', $errorRows));
    }
}
