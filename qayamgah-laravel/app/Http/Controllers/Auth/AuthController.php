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
     * Handle generic user login (matches Express.js behavior exactly)
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $email = $request->input('email');
        $password = $request->input('password');
        
        // Find user by email
        $user = User::where('email', $email)->first();
        
        // Verify password using proper hash check with legacy fallback
        $isValidPassword = false;
        if ($user) {
            $isValidPassword = Hash::check($password, $user->password_hash);
            
            // Fallback for legacy Express.js format during transition
            if (!$isValidPassword && $user->password_hash === 'hashed_' . $password) {
                $isValidPassword = true;
                // Upgrade to proper hash
                $user->password_hash = Hash::make($password);
                $user->save();
            }
        }
        
        if (!$user || !$isValidPassword) {
            return response()->json(['error' => 'Invalid email or password'], 401);
        }

        // Check if user is active (matches Express.js status/message exactly)
        if (!$user->is_active) {
            return response()->json(['error' => 'Account is deactivated'], 403);
        }

        // Generate Sanctum token for API authentication
        $token = $user->createToken('api-token')->plainTextToken;

        // Return exact Express.js format: {message, user, token} - no success flag
        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'fullName' => $user->full_name,
                'phone' => $user->phone,
                'isActive' => $user->is_active,
            ],
            'token' => $token
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

        // Generate Sanctum token for immediate login after registration (matches Express.js)
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'fullName' => $user->full_name,
                'phone' => $user->phone,
                'isActive' => $user->is_active,
            ],
            'token' => $token
        ], 201);
    }

    /**
     * Handle property owner login (matches Express.js behavior exactly)
     */
    public function propertyOwnerLogin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Email and password are required'], 400);
        }

        $email = $request->input('email');
        $password = $request->input('password');

        // Demo property owner credentials (matches Express.js)
        $demoOwnerEmail = 'owner@qayamgah.com';
        $demoOwnerPassword = 'owner123';

        // Check for demo property owner credentials
        if ($email === $demoOwnerEmail && $password === $demoOwnerPassword) {
            // Create or find demo property owner user
            $demoOwner = User::firstOrCreate(
                ['email' => $demoOwnerEmail],
                [
                    'username' => 'propertyowner',
                    'email' => $demoOwnerEmail,
                    'password_hash' => Hash::make($demoOwnerPassword),
                    'full_name' => 'Property Owner Demo',
                    'phone' => null,
                    'is_active' => true,
                ]
            );
            
            // Set role after creation (guarded attribute)
            if (!$demoOwner->role || $demoOwner->role !== 'property_owner') {
                $demoOwner->role = 'property_owner';
                $demoOwner->save();
            }

            // Generate proper Sanctum token
            $token = $demoOwner->createToken('owner-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $demoOwner->id,
                    'email' => $demoOwner->email,
                    'role' => $demoOwner->role,
                    'fullName' => $demoOwner->full_name,
                    'username' => $demoOwner->username,
                ],
                'token' => $token,
            ]);
        }

        // Check database for property owner users
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            return response()->json(['message' => 'Invalid property owner credentials'], 401);
        }

        // Verify user is active
        if (!$user->is_active) {
            return response()->json(['message' => 'Property owner account is deactivated'], 403);
        }

        // Verify user has correct role
        if ($user->role !== 'property_owner') {
            return response()->json(['message' => 'Invalid property owner credentials'], 401);
        }

        // Verify password using proper hash check with legacy fallback
        $isValidPassword = Hash::check($password, $user->password_hash);
        
        // Fallback for legacy Express.js format during transition
        if (!$isValidPassword && $user->password_hash === 'hashed_' . $password) {
            $isValidPassword = true;
            // Upgrade to proper hash
            $user->password_hash = Hash::make($password);
            $user->save();
        }
        
        if (!$isValidPassword) {
            return response()->json(['message' => 'Invalid property owner credentials'], 401);
        }

        // TODO: Get vendor record for this user (requires vendor model)
        // For now, we'll return success without vendor fields
        // In full implementation: check vendor status === 'approved'

        // Generate proper Sanctum token
        $token = $user->createToken('owner-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'fullName' => $user->full_name,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Handle customer login (role inferred from route)  
     */
    public function customerLogin(Request $request)
    {
        return $this->roleSpecificLogin($request, 'customer');
    }

    /**
     * Handle role-specific login without requiring role in request body
     */
    private function roleSpecificLogin(Request $request, string $role)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $credentials = $request->only('email', 'password');
        
        // Find user by email and verify role
        $user = User::where('email', $credentials['email'])->first();
        
        if (!$user || $user->role !== $role) {
            return response()->json(['error' => 'Invalid credentials or role'], 401);
        }

        // Verify password using proper hash check with legacy fallback
        $isValidPassword = Hash::check($credentials['password'], $user->password_hash);
        
        // Fallback for legacy Express.js format during transition
        if (!$isValidPassword && $user->password_hash === 'hashed_' . $credentials['password']) {
            $isValidPassword = true;
            // Upgrade to proper hash
            $user->password_hash = Hash::make($credentials['password']);
            $user->save();
        }
        
        if (!$isValidPassword) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        // Check if user is active
        if (!$user->is_active) {
            return response()->json(['error' => 'Account is not active'], 401);
        }

        // Generate Sanctum token for API authentication
        $token = $user->createToken($role . '-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'fullName' => $user->full_name,
            ],
            'token' => $token,
            'role' => $role
        ]);
    }

    /**
     * Handle user logout with Sanctum token revocation
     */
    public function logout(Request $request)
    {
        // Revoke current Sanctum token if user is authenticated via Sanctum
        $user = $request->user();
        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }
        
        // Find which guard has the authenticated user for session cleanup
        $activeGuard = $this->getActiveGuard();
        
        if ($activeGuard) {
            Auth::guard($activeGuard)->logout();
        }
        
        // Invalidate and regenerate session for security
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
        
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
     * Handle dedicated admin login (matches Express.js behavior)
     */
    public function adminLogin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Email and password are required'], 400);
        }

        $email = $request->input('email');
        $password = $request->input('password');

        // Demo admin credentials (matches Express.js)
        $demoAdminEmail = 'admin@qayamgah.com';
        $demoAdminPassword = 'admin123';

        // Check for demo admin credentials
        if ($email === $demoAdminEmail && $password === $demoAdminPassword) {
            // Create or find demo admin user for Sanctum token generation
            $demoAdmin = User::firstOrCreate(
                ['email' => $demoAdminEmail],
                [
                    'username' => 'admin',
                    'email' => $demoAdminEmail,
                    'password_hash' => Hash::make($demoAdminPassword),
                    'full_name' => 'System Administrator',
                    'phone' => null,
                    'is_active' => true,
                ]
            );
            
            // Set role after creation (guarded attribute)
            if (!$demoAdmin->role || $demoAdmin->role !== 'admin') {
                $demoAdmin->role = 'admin';
                $demoAdmin->save();
            }

            // Generate proper Sanctum token
            $token = $demoAdmin->createToken('admin-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $demoAdmin->id,
                    'username' => $demoAdmin->username,
                    'email' => $demoAdmin->email,
                    'role' => $demoAdmin->role,
                    'fullName' => $demoAdmin->full_name,
                ],
                'token' => $token,
            ]);
        }

        // Check database for admin users
        $user = User::where('email', $email)->first();
        
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Invalid admin credentials'], 401);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Admin account is deactivated'], 403);
        }

        // Verify password using proper hash check (consistent with other methods)
        $isValidPassword = Hash::check($password, $user->password_hash);
        
        // Fallback for legacy Express.js format during transition
        if (!$isValidPassword && $user->password_hash === 'hashed_' . $password) {
            $isValidPassword = true;
            // Upgrade to proper hash
            $user->password_hash = Hash::make($password);
            $user->save();
        }
        
        if (!$isValidPassword) {
            return response()->json(['message' => 'Invalid admin credentials'], 401);
        }

        // Generate proper Sanctum token
        $token = $user->createToken('admin-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'fullName' => $user->full_name,
            ],
            'token' => $token,
        ]);
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
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'fullName' => $user->full_name,
                'phone' => $user->phone,
                'isActive' => $user->is_active,
            ],
            'role' => $user->role
        ]);
    }
}
