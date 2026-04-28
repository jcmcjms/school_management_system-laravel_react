<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        if (empty($roles)) {
            return $next($request);
        }

        $user = $request->user();

        if (!$user || !in_array($user->role, $roles)) {
            // Don't redirect back to login for authenticated users — that creates a redirect loop.
            // Instead send them to /dashboard which RedirectController routes to their own dashboard.
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}