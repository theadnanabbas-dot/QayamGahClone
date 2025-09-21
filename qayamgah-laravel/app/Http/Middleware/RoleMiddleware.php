<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request - check if user has required role(s)
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Find authenticated user across all guards
        $user = $this->getAuthenticatedUser();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Check if user is active
        if (!$user->is_active) {
            return response()->json(['error' => 'Account is not active'], 403);
        }

        // Check if user has one of the required roles
        if (!in_array($user->role, $roles)) {
            return response()->json(['error' => 'Insufficient permissions'], 403);
        }

        return $next($request);
    }

    /**
     * Get authenticated user from any guard
     */
    private function getAuthenticatedUser()
    {
        $guards = ['admin', 'property_owner', 'customer', 'web'];
        
        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                // Set this as the active guard for the request
                Auth::shouldUse($guard);
                return Auth::guard($guard)->user();
            }
        }
        
        return null;
    }
}
