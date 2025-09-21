<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\City;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Models\Blog;
use App\Models\Testimonial;
use App\Models\Booking;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function __construct()
    {
        // Apply role middleware to all admin methods
        $this->middleware('role:admin');
    }

    /**
     * Get admin dashboard statistics
     */
    public function getDashboardStats()
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'total_properties' => Property::count(),
                'active_properties' => Property::where('is_active', true)->count(),
                'total_bookings' => Booking::count(),
                'pending_bookings' => Booking::where('status', 'PENDING')->count(),
                'confirmed_bookings' => Booking::where('status', 'CONFIRMED')->count(),
                'total_cities' => City::count(),
                'total_blogs' => Blog::count(),
                'pending_vendors' => Vendor::where('status', 'pending')->count(),
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Get all users with filtering and pagination
     */
    public function getUsers(Request $request)
    {
        try {
            $query = User::query();

            // Filter by role
            if ($request->has('role')) {
                $query->where('role', $request->role);
            }

            // Filter by active status
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            // Search by username, email, or full name
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereRaw('LOWER(username) LIKE ?', ["%".strtolower($search)."%"])
                      ->orWhereRaw('LOWER(email) LIKE ?', ["%".strtolower($search)."%"])
                      ->orWhereRaw('LOWER(full_name) LIKE ?', ["%".strtolower($search)."%"]);
                });
            }

            $perPage = min($request->get('per_page', 10), 100);
            $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Create a new user (admin only)
     */
    public function createUser(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'username' => 'required|string|max:255|unique:users',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'full_name' => 'nullable|string|max:255',
                'phone' => 'nullable|string|max:255',
                'role' => 'required|in:admin,property_owner,customer',
                'is_active' => 'boolean',
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
                'is_active' => $request->get('is_active', true),
            ]);

            // Set role after creation (guarded attribute)
            $user->role = $request->role;
            $user->save();

            return response()->json([
                'message' => 'User created successfully',
                'user' => $user
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Update user (admin only)
     */
    public function updateUser(Request $request, $id)
    {
        try {
            $user = User::find($id);
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'username' => 'sometimes|string|max:255|unique:users,username,' . $id,
                'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
                'password' => 'sometimes|string|min:8',
                'full_name' => 'nullable|string|max:255',
                'phone' => 'nullable|string|max:255',
                'role' => 'sometimes|in:admin,property_owner,customer',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 400);
            }

            // Update fillable attributes
            $user->fill($request->only(['username', 'email', 'full_name', 'phone', 'is_active']));

            // Handle password update
            if ($request->has('password')) {
                $user->password_hash = Hash::make($request->password);
            }

            // Handle role update (guarded attribute)
            if ($request->has('role')) {
                $user->role = $request->role;
            }

            $user->save();

            return response()->json([
                'message' => 'User updated successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Get all bookings with filtering
     */
    public function getBookings(Request $request)
    {
        try {
            $query = Booking::with(['user', 'roomCategory.property']);

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('start_at', '>=', $request->start_date);
            }
            if ($request->has('end_date')) {
                $query->where('end_at', '<=', $request->end_date);
            }

            $perPage = min($request->get('per_page', 10), 100);
            $bookings = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json($bookings);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Update booking status (admin only)
     */
    public function updateBookingStatus(Request $request, $id)
    {
        try {
            $booking = Booking::find($id);
            if (!$booking) {
                return response()->json(['error' => 'Booking not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:PENDING,CONFIRMED,CANCELLED,COMPLETED',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 400);
            }

            $booking->status = $request->status;
            $booking->save();

            return response()->json([
                'message' => 'Booking status updated successfully',
                'booking' => $booking
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Get all vendors with filtering
     */
    public function getVendors(Request $request)
    {
        try {
            $query = Vendor::with(['user']);

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $perPage = min($request->get('per_page', 10), 100);
            $vendors = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json($vendors);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Update vendor status (admin only)
     */
    public function updateVendorStatus(Request $request, $id)
    {
        try {
            $vendor = Vendor::find($id);
            if (!$vendor) {
                return response()->json(['error' => 'Vendor not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:pending,approved,rejected',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 400);
            }

            $vendor->status = $request->status;
            if ($request->status === 'approved') {
                $vendor->approved_at = now();
            } else {
                $vendor->approved_at = null;
            }
            $vendor->save();

            return response()->json([
                'message' => 'Vendor status updated successfully',
                'vendor' => $vendor
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Create a new city (admin only)
     */
    public function createCity(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'slug' => 'required|string|max:255|unique:cities',
                'image' => 'required|string',
                'hero_image' => 'nullable|string',
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 400);
            }

            $city = City::create($request->all());

            return response()->json([
                'message' => 'City created successfully',
                'city' => $city
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Create a new property category (admin only)
     */
    public function createPropertyCategory(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'image' => 'required|string',
                'slug' => 'required|string|max:255|unique:property_categories',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 400);
            }

            $category = PropertyCategory::create($request->all());

            return response()->json([
                'message' => 'Property category created successfully',
                'category' => $category
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Create a new blog post (admin only)
     */
    public function createBlog(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'slug' => 'required|string|max:255|unique:blogs',
                'excerpt' => 'required|string',
                'content' => 'required|string',
                'image' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 400);
            }

            $blog = Blog::create($request->all());

            return response()->json([
                'message' => 'Blog created successfully',
                'blog' => $blog
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Create a new testimonial (admin only)
     */
    public function createTestimonial(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'role' => 'required|string|max:255',
                'content' => 'required|string',
                'image' => 'required|string',
                'rating' => 'required|integer|min:1|max:5',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 400);
            }

            $testimonial = Testimonial::create($request->all());

            return response()->json([
                'message' => 'Testimonial created successfully',
                'testimonial' => $testimonial
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }
}
