<?php

namespace App\Http\Controllers;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\User;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $today = now()->startOfDay();
        $endOfDay = now()->endOfDay();

        $todayOrders = Order::whereBetween('created_at', [$today, $endOfDay])->get();
        $todayRevenue = $todayOrders->where('payment_status', 'paid')->sum('total');
        $todayOrdersCount = $todayOrders->count();

        $recentOrders = Order::with(['user', 'items.menuItem'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $lowStockItems = MenuItem::where('available_quantity', '<=', 5)
            ->where('available_quantity', '>', 0)
            ->orderBy('available_quantity', 'asc')
            ->limit(5)
            ->get();

        $lowStockInventory = InventoryItem::where('current_quantity', '<=', 'minimum_quantity')
            ->where('is_active', true)
            ->orderBy('current_quantity', 'asc')
            ->limit(5)
            ->get();

        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $totalMenuItems = MenuItem::where('is_available', true)->count();
        $totalCategories = MenuCategory::where('is_active', true)->count();

        $orderStatusCounts = [
            'pending' => Order::where('status', 'pending')->count(),
            'preparing' => Order::where('status', 'preparing')->count(),
            'ready' => Order::where('status', 'ready')->count(),
            'served' => Order::where('status', 'served')->count(),
        ];

        return Inertia::render('dashboard/admin', [
            'stats' => [
                'todayOrders' => $todayOrdersCount,
                'todayRevenue' => $todayRevenue,
                'totalUsers' => $totalUsers,
                'activeUsers' => $activeUsers,
                'totalMenuItems' => $totalMenuItems,
                'totalCategories' => $totalCategories,
            ],
            'recentOrders' => $recentOrders,
            'lowStockItems' => $lowStockItems,
            'lowStockInventory' => $lowStockInventory,
            'orderStatusCounts' => $orderStatusCounts,
        ]);
    }
}