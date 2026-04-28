<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RedirectController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        return match ($user->role) {
            'admin', 'manager' => redirect()->route('admin.dashboard'),
            'staff'            => redirect()->route('staff.dashboard'),
            'student', 'parent' => redirect()->route('customer.dashboard'),
            'faculty'          => redirect()->route('faculty.dashboard'),
            default            => redirect()->route('menu'),
        };
    }
}