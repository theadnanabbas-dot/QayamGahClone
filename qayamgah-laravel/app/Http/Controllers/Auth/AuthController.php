<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Handle user login with role-based guard selection
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
            'role' => 'required|in:admin,property_owner,customer'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $credentials = $request->only('email', 'password');
        $role = $request->input('role');
        
        // Find user by email and verify role
        $user = User::where('email', $credentials['email'])->first();
        
        if (!$user || $user->role !== $role) {
            return response()->json(['error' => 'Invalid credentials or role'], 401);
        }

        // Verify password using our custom password field
        if (!Hash::check($credentials['password'], $user->password_hash)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        // Check if user is active
        if (!$user->is_active) {
            return response()->json(['error' => 'Account is not active'], 401);
        }

        // Login user with role-specific guard
        Auth::guard($role)->login($user);
        
        // Regenerate session for security
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'role' => $role
        ]);
    }

    /**
     * Handle user registration
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'full_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'role' => 'required|in:property_owner,customer'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
            'full_name' => $request->full_name,
            'phone' => $request->phone,
            'is_active' => true,
        ]);

        // Set role after creation (guarded attribute)
        $user->role = $request->role;
        $user->save();

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user
        ], 201);
    }

    /**
     * Handle user logout
     */
    public function logout(Request $request)
    {
        // Find which guard has the authenticated user
        $activeGuard = $this->getActiveGuard();
        
        if ($activeGuard) {
            Auth::guard($activeGuard)->logout();
        }
        
        // Invalidate and regenerate session for security
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return response()->json(['message' => 'Logout successful']);
    }

    /**
     * Find the currently active guard
     */
    private function getActiveGuard()
    {
        $guards = ['admin', 'property_owner', 'customer', 'web'];
        
        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                return $guard;
            }
        }
        
        return null;
    }

    /**
     * Get current authenticated user
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        return response()->json([
            'user' => $user,
            'role' => $user->role
        ]);
    }
}
