<?php

namespace Database\Seeders;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $mainDishes = MenuCategory::create([
            'name' => 'Main Dishes',
            'slug' => 'main-dishes',
            'description' => 'Hearty and filling main courses',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        MenuItem::create([
            'category_id' => $mainDishes->id,
            'name' => 'Chicken Adobo',
            'slug' => 'chicken-adobo',
            'description' => 'Tender chicken braised in soy sauce, vinegar, and garlic',
            'price' => 120.00,
            'available_quantity' => 50,
            'low_stock_threshold' => 10,
            'availability_status' => 'available',
            'allergens' => ['soy'],
            'nutritional_info' => [
                'Calories' => '450 kcal',
                'Protein' => '35g',
                'Carbs' => '15g',
                'Fat' => '25g',
            ],
            'is_available' => true,
            'is_featured' => true,
            'sort_order' => 1,
        ]);

        MenuItem::create([
            'category_id' => $mainDishes->id,
            'name' => 'Pork Sinigang',
            'slug' => 'pork-sinigang',
            'description' => 'Sour pork soup with tamarind and vegetables',
            'price' => 150.00,
            'available_quantity' => 30,
            'low_stock_threshold' => 5,
            'availability_status' => 'available',
            'allergens' => [],
            'nutritional_info' => [
                'Calories' => '380 kcal',
                'Protein' => '28g',
                'Carbs' => '20g',
                'Fat' => '18g',
            ],
            'is_available' => true,
            'is_featured' => false,
            'sort_order' => 2,
        ]);

        $drinks = MenuCategory::create([
            'name' => 'Drinks',
            'slug' => 'drinks',
            'description' => 'Refreshing beverages',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        MenuItem::create([
            'category_id' => $drinks->id,
            'name' => 'Iced Lemon Tea',
            'slug' => 'iced-lemon-tea',
            'description' => 'Freshly brewed tea with lemon',
            'price' => 45.00,
            'available_quantity' => 100,
            'low_stock_threshold' => 20,
            'availability_status' => 'available',
            'allergens' => [],
            'nutritional_info' => [
                'Calories' => '80 kcal',
                'Sugar' => '18g',
            ],
            'is_available' => true,
            'is_featured' => true,
            'sort_order' => 1,
        ]);
    }
}