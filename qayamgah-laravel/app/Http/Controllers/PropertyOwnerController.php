<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\RoomCategory;
use App\Models\Booking;
use App\Models\ImportedCalendar;
use App\Models\ImportedEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PropertyOwnerController extends Controller
{
    public function __construct()
    {
        // Apply role middleware to all property owner methods
        $this->middleware('role:property_owner');
    }

    /**
     * Get property owner dashboard statistics
     */
    public function getDashboardStats()
    {
        try {
            $userId = Auth::id();
            
            $stats = [
                'total_properties' => Property::where('owner_id', $userId)->count(),
                'active_properties' => Property::where('owner_id', $userId)->where('is_active', true)->count(),
                'total_bookings' => Booking::whereHas('roomCategory.property', function($q) use ($userId) {
                    $q->where('owner_id', $userId);
                })->count(),
                'pending_bookings' => Booking::whereHas('roomCategory.property', function($q) use ($userId) {
                    $q->where('owner_id', $userId);
                })->where('status', 'PENDING')->count(),
                'confirmed_bookings' => Booking::whereHas('roomCategory.property', function($q) use ($userId) {
                    $q->where('owner_id', $userId);
                })->where('status', 'CONFIRMED')->count(),
                'total_revenue' => Booking::whereHas('roomCategory.property', function($q) use ($userId) {
                    $q->where('owner_id', $userId);
                })->where('status', 'COMPLETED')->sum('total_price'),
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Get properties owned by the authenticated user
     */
    public function getMyProperties(Request $request)
    {
        try {
            $userId = Auth::id();
            $query = Property::with(['city', 'category', 'roomCategories'])
                           ->where('owner_id', $userId);

            // Filter by active status
            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            // Search by title
            if ($request->has('search')) {
                $search = $request->search;
                $query->whereRaw('LOWER(title) LIKE ?', ["%".strtolower($search)."%"]);
            }

            $perPage = min($request->get('per_page', 10), 50);
            $properties = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json($properties);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Create a new property
     */
    public function createProperty(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'property_type' => 'required|in:private,commercial',
                'max_guests' => 'required|integer|min:1',
                'address' => 'required|string',
                'phone_number' => 'nullable|string',
                'city_id' => 'required|string|exists:cities,id',
                'category_id' => 'required|string|exists:property_categories,id',
                'bedrooms' => 'required|integer|min:0',
                'bathrooms' => 'required|integer|min:0',
                'amenities' => 'nullable|array',
                'images' => 'nullable|array',
                'main_image' => 'required|string',
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 400);
            }

            $property = Property::create([
                'title' => $request->title,
                'slug' => Str::slug($request->title . '-' . Str::random(8)),
                'description' => $request->description,
                'property_type' => $request->property_type,
                'max_guests' => $request->max_guests,
                'address' => $request->address,
                'phone_number' => $request->phone_number,
                'owner_id' => Auth::id(),
                'city_id' => $request->city_id,
                'category_id' => $request->category_id,
                'bedrooms' => $request->bedrooms,
                'bathrooms' => $request->bathrooms,
                'amenities' => $request->amenities ?? [],
                'images' => $request->images ?? [],
                'main_image' => $request->main_image,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'is_active' => true,
            ]);

            return response()->json([
                'message' => 'Property created successfully',
                'property' => $property
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Update a property (owner only)
     */
    public function updateProperty(Request $request, $id)
    {
        try {
            $property = Property::where('id', $id)
                              ->where('owner_id', Auth::id())
                              ->first();
                              
            if (!$property) {
                return response()->json(['error' => 'Property not found'], 404);
            }

            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'property_type' => 'sometimes|in:private,commercial',
                'max_guests' => 'sometimes|integer|min:1',
                'address' => 'sometimes|string',
                'phone_number' => 'nullable|string',
                'city_id' => 'sometimes|string|exists:cities,id',
                'category_id' => 'sometimes|string|exists:property_categories,id',
                'bedrooms' => 'sometimes|integer|min:0',
                'bathrooms' => 'sometimes|integer|min:0',
                'amenities' => 'nullable|array',
                'images' => 'nullable|array',
                'main_image' => 'sometimes|string',
                'latitude' => 'nullable|numeric',
                'longitude' => 'nullable|numeric',
                'is_active' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 400);
            }

            $property->update($request->all());

            return response()->json([
                'message' => 'Property updated successfully',
                'property' => $property
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Get bookings for property owner's properties
     */
    public function getMyBookings(Request $request)
    {
        try {
            $userId = Auth::id();
            $query = Booking::with(['user', 'roomCategory.property'])
                          ->whereHas('roomCategory.property', function($q) use ($userId) {
                              $q->where('owner_id', $userId);
                          });

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by property
            if ($request->has('property_id')) {
                $query->whereHas('roomCategory', function($q) use ($request) {
                    $q->where('property_id', $request->property_id);
                });
            }

            $perPage = min($request->get('per_page', 10), 50);
            $bookings = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json($bookings);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Create a room category for a property
     */
    public function createRoomCategory(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'property_id' => 'required|string|exists:properties,id',
                'name' => 'required|string|max:255',
                'image' => 'required|string',
                'max_guest_capacity' => 'required|integer|min:1',
                'bathrooms' => 'required|integer|min:0',
                'beds' => 'required|integer|min:0',
                'area_sq_ft' => 'nullable|integer|min:0',
                'price_per_4_hours' => 'required|numeric|min:0',
                'price_per_6_hours' => 'required|numeric|min:0',
                'price_per_12_hours' => 'required|numeric|min:0',
                'price_per_24_hours' => 'required|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 400);
            }

            // Verify property ownership
            $property = Property::where('id', $request->property_id)
                              ->where('owner_id', Auth::id())
                              ->first();
                              
            if (!$property) {
                return response()->json(['error' => 'Property not found'], 404);
            }

            $roomCategory = RoomCategory::create($request->all());

            return response()->json([
                'message' => 'Room category created successfully',
                'room_category' => $roomCategory
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Get imported calendars for property owner
     */
    public function getMyImportedCalendars()
    {
        try {
            $calendars = ImportedCalendar::where('user_id', Auth::id())
                                       ->with(['importedEvents'])
                                       ->orderBy('created_at', 'desc')
                                       ->get();

            return response()->json($calendars);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Create an imported calendar
     */
    public function createImportedCalendar(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'source_url' => 'required|url',
                'platform' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 400);
            }

            $calendar = ImportedCalendar::create([
                'user_id' => Auth::id(),
                'name' => $request->name,
                'source_url' => $request->source_url,
                'platform' => $request->platform,
                'is_active' => true,
                'last_sync_status' => 'pending',
            ]);

            return response()->json([
                'message' => 'Calendar imported successfully',
                'calendar' => $calendar
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }
}
