<?php

namespace App\Http\Controllers;

use App\Models\RetailCategory;
use App\Models\RetailItem;
use App\Models\Vendor;
use App\Models\VendorProduct;
use App\Models\VendorSale;
use App\Models\VendorSettlement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminRetailController extends Controller
{
    // Retail Categories
    public function categories()
    {
        $categories = RetailCategory::withCount('retailItems')->orderBy('sort_order')->get();
        return Inertia::render('admin/retail/categories', ['categories' => $categories]);
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'integer|min:0',
        ]);

        RetailCategory::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => true,
        ]);

        return back()->with('success', 'Category created.');
    }

    public function updateCategory(Request $request, RetailCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sort_order' => 'integer|min:0',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);
        return back()->with('success', 'Category updated.');
    }

    public function destroyCategory(RetailCategory $category)
    {
        if ($category->retailItems()->count() > 0) {
            return back()->withErrors(['category' => 'Cannot delete category with items.']);
        }
        $category->delete();
        return back()->with('success', 'Category deleted.');
    }

    // Retail Items
    public function items(Request $request)
    {
        $query = RetailItem::with(['category', 'vendor']);

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }
        if ($request->category_id) {
            $query->where('retail_category_id', $request->category_id);
        }

        $items = $query->orderBy('name')->paginate(20);
        $categories = RetailCategory::where('is_active', true)->orderBy('name')->get();
        $vendors = Vendor::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('admin/retail/items', [
            'items' => $items,
            'categories' => $categories,
            'vendors' => $vendors,
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    public function createItem()
    {
        $categories = RetailCategory::where('is_active', true)->orderBy('name')->get();
        $vendors = Vendor::where('is_active', true)->orderBy('name')->get();
        return Inertia::render('admin/retail/item-form', ['categories' => $categories, 'vendors' => $vendors]);
    }

    public function storeItem(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'retail_category_id' => 'required|exists:retail_categories,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'available_quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $imageUrl = '/storage/' . $request->file('image')->store('retail-items', 'public');
        }

        $item = RetailItem::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . Str::random(4),
            'retail_category_id' => $validated['retail_category_id'],
            'vendor_id' => $validated['vendor_id'] ?? null,
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'image_url' => $imageUrl,
            'available_quantity' => $validated['available_quantity'],
            'low_stock_threshold' => $validated['low_stock_threshold'] ?? 10,
            'vendor_commission' => $validated['vendor_commission'] ?? 70,
            'is_active' => true,
            'status' => 'available',
        ]);

        return redirect()->route('admin.retail.items')->with('success', 'Item created.');
    }

    public function editItem(RetailItem $item)
    {
        $categories = RetailCategory::where('is_active', true)->orderBy('name')->get();
        $vendors = Vendor::where('is_active', true)->orderBy('name')->get();
        return Inertia::render('admin/retail/item-form', ['item' => $item, 'categories' => $categories, 'vendors' => $vendors]);
    }

    public function updateItem(Request $request, RetailItem $item)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'retail_category_id' => 'required|exists:retail_categories,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'available_quantity' => 'required|integer|min:0',
            'vendor_commission' => 'nullable|numeric|min:0|max:100',
            'low_stock_threshold' => 'integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
            'is_active' => 'boolean',
        ]);

        $updateData = $validated;
        unset($updateData['image']);

        if ($request->hasFile('image')) {
            if ($item->image_url && str_starts_with($item->image_url, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $item->image_url));
            }
            $updateData['image_url'] = '/storage/' . $request->file('image')->store('retail-items', 'public');
        }

        $item->update($updateData);
        $item->updateStatus();

        return redirect()->route('admin.retail.items')->with('success', 'Item updated.');
    }

    public function destroyItem(RetailItem $item)
    {
        $item->delete();
        return back()->with('success', 'Item deleted.');
    }

    public function adjustStock(Request $request, RetailItem $item)
    {
        $validated = $request->validate([
            'adjustment' => 'required|integer',
        ]);

        $newQty = $item->available_quantity + $validated['adjustment'];
        $item->update(['available_quantity' => max(0, $newQty)]);
        $item->updateStatus();

        return back()->with('success', 'Stock updated.');
    }

    // Vendors
    public function vendors()
    {
        $vendors = Vendor::withCount('products')->orderBy('name')->get();
        return Inertia::render('admin/retail/vendors', ['vendors' => $vendors]);
    }

    public function storeVendor(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        Vendor::create($validated + ['is_active' => true]);
        return back()->with('success', 'Vendor created.');
    }

    public function updateVendor(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $vendor->update($validated);
        return back()->with('success', 'Vendor updated.');
    }

    public function destroyVendor(Vendor $vendor)
    {
        $vendor->delete();
        return back()->with('success', 'Vendor deleted.');
    }

    // Vendor Products
    public function vendorProducts(Request $request)
    {
        $vendors = Vendor::where('is_active', true)->orderBy('name')->get();
        
        $query = VendorProduct::with('vendor');

        if ($request->vendor_id) {
            $query->where('vendor_id', $request->vendor_id);
        }

        $products = $query->orderBy('name')->paginate(20);

        return Inertia::render('admin/retail/vendor-products', [
            'products' => $products,
            'vendors' => $vendors,
            'filters' => $request->only(['vendor_id']),
        ]);
    }

    public function createVendorProduct()
    {
        $vendors = Vendor::where('is_active', true)->orderBy('name')->get();
        return Inertia::render('admin/retail/vendor-product-form', ['vendors' => $vendors]);
    }

    public function storeVendorProduct(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $imageUrl = '/storage/' . $request->file('image')->store('vendor-products', 'public');
        }

        VendorProduct::create($validated + ['image_url' => $imageUrl, 'is_active' => true]);

        return back()->with('success', 'Product added.');
    }

    public function updateVendorProduct(Request $request, VendorProduct $product)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $product->update($validated);
        return back()->with('success', 'Product updated.');
    }

    public function destroyVendorProduct(VendorProduct $product)
    {
        $product->delete();
        return back()->with('success', 'Product deleted.');
    }

    // Quick sell page - show available vendor products
    public function quickSell()
    {
        $products = VendorProduct::with('vendor')->where('is_active', true)->where('stock_quantity', '>', 0)->orderBy('name')->get();
        $vendors = Vendor::where('is_active', true)->orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/retail/quick-sell', [
            'products' => $products,
            'vendors' => $vendors,
        ]);
    }

    // Record a vendor product sale
    public function recordVendorSale(Request $request)
    {
        $validated = $request->validate([
            'vendor_product_id' => 'required|exists:vendor_products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = VendorProduct::findOrFail($validated['vendor_product_id']);

        if ($product->stock_quantity < $validated['quantity']) {
            return back()->withErrors(['error' => 'Not enough stock']);
        }

        $total = $product->price * $validated['quantity'];

        // Deduct stock
        $product->decrementStock($validated['quantity']);

        // Record sale
        VendorSale::create([
            'vendor_product_id' => $product->id,
            'quantity' => $validated['quantity'],
            'unit_price' => $product->price,
            'total' => $total,
            'sold_at' => now(),
        ]);

        return back()->with('success', "Sold {$validated['quantity']} x {$product->name}");
    }

    // Vendor Settlements
    public function settlements(Request $request)
    {
        $vendorId = $request->vendor_id;
        $date = $request->date ?? now()->toDateString();

        $vendors = Vendor::where('is_active', true)->orderBy('name')->get();

        $query = VendorSettlement::with('vendor')->where('settlement_date', $date);
        if ($vendorId) {
            $query->where('vendor_id', $vendorId);
        }
        $settlements = $query->orderBy('vendor_id')->get();

        // Calculate today's sales for each vendor (not yet settled)
        $todaySales = [];
        foreach ($vendors as $vendor) {
            $sales = VendorSale::whereHas('vendorProduct', function ($q) use ($vendor) {
                $q->where('vendor_id', $vendor->id);
            })->whereDate('sold_at', $date)->get();

            $totalSales = $sales->sum('total');
            $itemsSold = $sales->sum('quantity');

            // Get current stock
            $currentStock = $vendor->products()->sum('stock_quantity');

            $todaySales[$vendor->id] = [
                'total_sales' => $totalSales,
                'items_sold' => $itemsSold,
                'current_stock' => $currentStock,
                'vendor_share' => $totalSales * 0.7, // 70% to vendor
                'canteen_share' => $totalSales * 0.3, // 30% to canteen
            ];
        }

        return Inertia::render('admin/retail/settlements', [
            'settlements' => $settlements,
            'vendors' => $vendors,
            'todaySales' => $todaySales,
            'filters' => ['vendor_id' => $vendorId, 'date' => $date],
        ]);
    }

    public function createSettlement(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'settlement_date' => 'required|date',
            'items_returned' => 'required|integer|min:0',
        ]);

        $vendor = Vendor::findOrFail($validated['vendor_id']);
        $date = $validated['settlement_date'];

        // Get sales for this vendor on this date
        $sales = VendorSale::whereHas('vendorProduct', function ($q) use ($vendor) {
            $q->where('vendor_id', $vendor->id);
        })->whereDate('sold_at', $date)->get();

        $totalSales = $sales->sum('total');
        $itemsSold = $sales->sum('quantity');

        $vendorShare = $totalSales * 0.7;
        $canteenShare = $totalSales * 0.3;

        // Create settlement
        $settlement = VendorSettlement::create([
            'vendor_id' => $validated['vendor_id'],
            'settlement_date' => $validated['settlement_date'],
            'total_sales' => $totalSales,
            'items_sold' => $itemsSold,
            'vendor_share' => $vendorShare,
            'canteen_share' => $canteenShare,
            'items_returned' => $validated['items_returned'],
            'status' => 'completed',
            'notes' => "Items returned to vendor: {$validated['items_returned']}",
        ]);

        // Return items to vendor (reset stock)
        $vendor->products()->update(['stock_quantity' => $validated['items_returned']]);

        return back()->with('success', "Settlement completed. Vendor receives ₱" . number_format($vendorShare, 2));
    }
}