<?php

namespace App\Services;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\User;
use App\Models\InventoryItem;
use Illuminate\Support\Collection;

class DashboardService extends BaseService
{
    protected string $modelClass = Order::class;

    public function getAdminStats(): array
    {
        $today = now()->startOfDay();
        $endOfDay = now()->endOfDay();

        $todayOrders = Order::whereBetween('created_at', [$today, $endOfDay])->get();
        $todayRevenue = $todayOrders->where('payment_status', 'paid')->sum('total');

        return [
            'todayOrders' => $todayOrders->count(),
            'todayRevenue' => $todayRevenue,
            'totalUsers' => User::count(),
            'activeUsers' => User::where('is_active', true)->count(),
            'totalMenuItems' => MenuItem::where('is_available', true)->count(),
            'totalCategories' => MenuCategory::where('is_active', true)->count(),
        ];
    }

    public function getRecentOrders(int $limit = 10): Collection
    {
        return Order::with(['user', 'items.menuItem'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getLowStockMenuItems(int $limit = 5): Collection
    {
        return MenuItem::where('available_quantity', '<=', 5)
            ->where('available_quantity', '>', 0)
            ->orderBy('available_quantity', 'asc')
            ->limit($limit)
            ->get();
    }

    public function getLowStockInventory(int $limit = 5): Collection
    {
        return InventoryItem::where('current_quantity', '<=', 'minimum_quantity')
            ->where('is_active', true)
            ->orderBy('current_quantity', 'asc')
            ->limit($limit)
            ->get();
    }

    public function getOrderStatusCounts(): array
    {
        return [
            'pending' => Order::where('status', 'pending')->count(),
            'preparing' => Order::where('status', 'preparing')->count(),
            'ready' => Order::where('status', 'ready')->count(),
            'served' => Order::where('status', 'served')->count(),
        ];
    }

    public function getFullDashboardData(): array
    {
        return [
            'stats' => $this->getAdminStats(),
            'recentOrders' => $this->getRecentOrders(),
            'lowStockItems' => $this->getLowStockMenuItems(),
            'lowStockInventory' => $this->getLowStockInventory(),
            'orderStatusCounts' => $this->getOrderStatusCounts(),
        ];
    }
}
