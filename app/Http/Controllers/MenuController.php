<?php

namespace App\Http\Controllers;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index()
    {
        $categories = MenuCategory::with('menuItems')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function ($category) {
                $category->menuItems = $category->menuItems
                    ->filter(fn ($item) => 
                        $item->is_available && 
                        $item->available_quantity > 0 &&
                        !in_array($item->availability_status, ['sold_out', 'hidden'])
                    )
                    ->values();
                return $category;
            });

        return Inertia::render('menu/index', [
            'categories' => $categories,
        ]);
    }

    public function show(MenuItem $menuItem)
    {
        $menuItem->load(['category', 'ingredients']);

        return Inertia::render('menu/show', [
            'item' => $menuItem,
        ]);
    }
}