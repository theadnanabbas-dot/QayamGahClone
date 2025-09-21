<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\City;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Models\RoomCategory;
use App\Models\Blog;
use App\Models\Testimonial;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PublicController extends Controller
{
    /**
     * Get user by ID (public profile view)
     */
    public function getUser($id)
    {
        try {
            $user = User::find($id);
            
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }
            
            // Return user without sensitive data
            return response()->json([
                'id' => $user->id,
                'username' => $user->username,
                'full_name' => $user->full_name,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Get all cities with property counts
     */
    public function getCities()
    {
        try {
            $cities = City::orderBy('name')->get();
            return response()->json($cities);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Get city by ID or slug
     */
    public function getCity($identifier)
    {
        try {
            $city = City::where(function($query) use ($identifier) {
                          $query->where('id', $identifier)
                                ->orWhere('slug', $identifier);
                      })->first();
            
            if (!$city) {
                return response()->json(['error' => 'City not found'], 404);
            }
            
            return response()->json($city);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Get all property categories
     */
    public function getPropertyCategories()
    {
        try {
            $categories = PropertyCategory::orderBy('name')->get();
            return response()->json($categories);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Get properties with filtering and pagination
     */
    public function getProperties(Request $request)
    {
        try {
            $query = Property::with(['city', 'category', 'owner'])
                           ->where('is_active', true);

            // Filter by city
            if ($request->has('city_id')) {
                $query->where('city_id', $request->city_id);
            }

            // Filter by category
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            // Filter by max guests
            if ($request->has('max_guests')) {
                $query->where('max_guests', '>=', $request->max_guests);
            }

            // Search by title or description
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereRaw('LOWER(title) LIKE ?', ["%".strtolower($search)."%"])
                      ->orWhereRaw('LOWER(description) LIKE ?', ["%".strtolower($search)."%"]);
                });
            }

            // Featured properties
            if ($request->has('featured') && $request->featured === 'true') {
                $query->where('is_featured', true);
            }

            // Order by rating or created date
            $orderBy = $request->get('order_by', 'created_at');
            $orderDirection = $request->get('order_direction', 'desc');
            $query->orderBy($orderBy, $orderDirection);

            // Pagination
            $perPage = min($request->get('per_page', 12), 50); // Max 50 per page
            $properties = $query->paginate($perPage);

            return response()->json($properties);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Get property by ID or slug
     */
    public function getProperty($identifier)
    {
        try {
            $property = Property::with(['city', 'category', 'owner', 'roomCategories'])
                              ->where(function($query) use ($identifier) {
                                  $query->where('id', $identifier)
                                        ->orWhere('slug', $identifier);
                              })
                              ->where('is_active', true)
                              ->first();
            
            if (!$property) {
                return response()->json(['error' => 'Property not found'], 404);
            }
            
            return response()->json($property);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Get all blogs with pagination
     */
    public function getBlogs(Request $request)
    {
        try {
            $query = Blog::whereNotNull('published_at')
                       ->where('published_at', '<=', now())
                       ->orderBy('published_at', 'desc');
            
            // Search functionality
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->whereRaw('LOWER(title) LIKE ?', ["%".strtolower($search)."%"])
                      ->orWhereRaw('LOWER(excerpt) LIKE ?', ["%".strtolower($search)."%"])
                      ->orWhereRaw('LOWER(content) LIKE ?', ["%".strtolower($search)."%"]);
                });
            }

            $perPage = min($request->get('per_page', 10), 50);
            $blogs = $query->paginate($perPage);

            return response()->json($blogs);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Get blog by ID or slug
     */
    public function getBlog($identifier)
    {
        try {
            $blog = Blog::where(function($query) use ($identifier) {
                          $query->where('id', $identifier)
                                ->orWhere('slug', $identifier);
                      })
                      ->whereNotNull('published_at')
                      ->where('published_at', '<=', now())
                      ->first();
            
            if (!$blog) {
                return response()->json(['error' => 'Blog not found'], 404);
            }
            
            return response()->json($blog);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Get all testimonials
     */
    public function getTestimonials()
    {
        try {
            $testimonials = Testimonial::orderBy('rating', 'desc')->get();
            return response()->json($testimonials);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Serve placeholder images (similar to Express.js route)
     */
    public function getPlaceholderImage(Request $request, $path)
    {
        // Generate placeholder based on image type and path
        $imageUrl = "https://picsum.photos/400/300";

        if (str_contains($path, 'cities')) {
            $imageUrl = "https://picsum.photos/600/400"; // City images - wider format
        } elseif (str_contains($path, 'properties')) {
            $imageUrl = "https://picsum.photos/800/600"; // Property images - larger format
        } elseif (str_contains($path, 'categories')) {
            $imageUrl = "https://picsum.photos/300/200"; // Category icons - smaller format
        } elseif (str_contains($path, 'testimonials')) {
            $imageUrl = "https://picsum.photos/100/100"; // Profile photos - square format
        } elseif (str_contains($path, 'blog')) {
            $imageUrl = "https://picsum.photos/800/400"; // Blog images - wide format
        }

        // Redirect to placeholder image
        return redirect($imageUrl);
    }
}
