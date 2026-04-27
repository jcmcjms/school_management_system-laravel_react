<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $roles = ''): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login')->with('message', 'Please log in to access this page.');
        }

        $user = $request->user();

        if (empty($roles)) {
            return $next($request);
        }

        $allowedRoles = array_map('trim', explode(',', $roles));

        if (!$user || !in_array($user->role, $allowedRoles)) {
            return redirect()->route('dashboard')->with('error', 'You do not have permission to access this page.');
        }

        return $next($request);
    }
}