<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function index()
    {
        $data = $this->dashboardService->getFullDashboardData();

        return Inertia::render('dashboard/admin', $data);
    }
}
