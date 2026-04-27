<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login')->with('message', 'Please log in to access this page.');
        }

        $user = $request->user();

        if (empty($roles)) {
            return $next($request);
        }

        if (!$user || !in_array($user->role, $roles)) {
            abort(Response::HTTP_FORBIDDEN, 'You do not have permission to access this page.');
        }

        return $next($request);
    }
}