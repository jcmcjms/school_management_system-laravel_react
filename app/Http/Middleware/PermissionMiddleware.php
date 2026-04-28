<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        if (empty($permissions)) {
            return $next($request);
        }

        $user = $request->user();

        if (!$user || !$user->hasAnyPermission(...$permissions)) {
            // Return 403 for authenticated users who lack the permission
            abort(403, 'You do not have permission to access this resource.');
        }

        return $next($request);
    }
}
