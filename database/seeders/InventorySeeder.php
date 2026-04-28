<?php

namespace Database\Seeders;

use App\Models\InventoryItem;
use App\Models\MenuItemIngredient;
use App\Models\MenuItem;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        $supplier = Supplier::create([
            'name' => 'Fresh Market Supplies',
            'contact_person' => 'Juan Santos',
            'email' => 'juan@freshmarket.ph',
            'phone' => '09171234567',
            'address' => 'Makati, Metro Manila',
            'is_active' => true,
        ]);

        $rice = InventoryItem::create([
            'name' => 'Rice', 'sku' => 'INV-RICE-001', 'category' => 'Grains',
            'current_quantity' => 50.000, 'minimum_quantity' => 10.000, 'unit' => 'kg',
            'unit_cost' => 55.00, 'supplier_id' => $supplier->id, 'is_active' => true,
        ]);

        $chicken = InventoryItem::create([
            'name' => 'Chicken', 'sku' => 'INV-CHKN-001', 'category' => 'Meat',
            'current_quantity' => 20.000, 'minimum_quantity' => 5.000, 'unit' => 'kg',
            'unit_cost' => 180.00, 'supplier_id' => $supplier->id, 'is_active' => true,
        ]);

        $pork = InventoryItem::create([
            'name' => 'Pork Belly', 'sku' => 'INV-PORK-001', 'category' => 'Meat',
            'current_quantity' => 15.000, 'minimum_quantity' => 5.000, 'unit' => 'kg',
            'unit_cost' => 250.00, 'supplier_id' => $supplier->id, 'is_active' => true,
        ]);

        $soySauce = InventoryItem::create([
            'name' => 'Soy Sauce', 'sku' => 'INV-SOY-001', 'category' => 'Condiments',
            'current_quantity' => 5.000, 'minimum_quantity' => 2.000, 'unit' => 'L',
            'unit_cost' => 45.00, 'supplier_id' => $supplier->id, 'is_active' => true,
        ]);

        $vinegar = InventoryItem::create([
            'name' => 'Vinegar', 'sku' => 'INV-VIN-001', 'category' => 'Condiments',
            'current_quantity' => 3.000, 'minimum_quantity' => 1.000, 'unit' => 'L',
            'unit_cost' => 30.00, 'supplier_id' => $supplier->id, 'is_active' => true,
        ]);

        InventoryItem::create([
            'name' => 'Cooking Oil', 'sku' => 'INV-OIL-001', 'category' => 'Condiments',
            'current_quantity' => 8.000, 'minimum_quantity' => 3.000, 'unit' => 'L',
            'unit_cost' => 85.00, 'supplier_id' => $supplier->id, 'is_active' => true,
        ]);

        InventoryItem::create([
            'name' => 'Tea Leaves', 'sku' => 'INV-TEA-001', 'category' => 'Beverages',
            'current_quantity' => 2.000, 'minimum_quantity' => 0.500, 'unit' => 'kg',
            'unit_cost' => 200.00, 'supplier_id' => $supplier->id, 'is_active' => true,
        ]);

        InventoryItem::create([
            'name' => 'Tamarind Mix', 'sku' => 'INV-TAM-001', 'category' => 'Condiments',
            'current_quantity' => 1.500, 'minimum_quantity' => 0.500, 'unit' => 'kg',
            'unit_cost' => 60.00, 'supplier_id' => $supplier->id, 'is_active' => true,
        ]);

        // Link ingredients to menu items
        $adobo = MenuItem::where('slug', 'chicken-adobo')->first();
        if ($adobo) {
            MenuItemIngredient::create(['menu_item_id' => $adobo->id, 'inventory_item_id' => $rice->id, 'ingredient_name' => 'Rice', 'quantity_required' => 0.200, 'unit' => 'kg']);
            MenuItemIngredient::create(['menu_item_id' => $adobo->id, 'inventory_item_id' => $chicken->id, 'ingredient_name' => 'Chicken', 'quantity_required' => 0.150, 'unit' => 'kg']);
            MenuItemIngredient::create(['menu_item_id' => $adobo->id, 'inventory_item_id' => $soySauce->id, 'ingredient_name' => 'Soy Sauce', 'quantity_required' => 0.030, 'unit' => 'L']);
            MenuItemIngredient::create(['menu_item_id' => $adobo->id, 'inventory_item_id' => $vinegar->id, 'ingredient_name' => 'Vinegar', 'quantity_required' => 0.020, 'unit' => 'L']);
        }

        $sinigang = MenuItem::where('slug', 'pork-sinigang')->first();
        if ($sinigang) {
            MenuItemIngredient::create(['menu_item_id' => $sinigang->id, 'inventory_item_id' => $rice->id, 'ingredient_name' => 'Rice', 'quantity_required' => 0.200, 'unit' => 'kg']);
            MenuItemIngredient::create(['menu_item_id' => $sinigang->id, 'inventory_item_id' => $pork->id, 'ingredient_name' => 'Pork Belly', 'quantity_required' => 0.200, 'unit' => 'kg']);
        }
    }
}
