<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\RoomCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    /**
     * Create a new booking (customer)
     */
    public function createBooking(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'room_category_id' => 'required|string|exists:room_categories,id',
                'customer_name' => 'required|string|max:255',
                'customer_email' => 'required|email|max:255',
                'customer_phone' => 'nullable|string|max:255',
                'guests' => 'required|integer|min:1',
                'stay_type' => 'required|in:4h,6h,12h,24h',
                'start_at' => 'required|date|after:now',
                'end_at' => 'required|date|after:start_at',
                'currency' => 'string|in:PKR,USD',
                'payment_method' => 'required|in:cash,card,bank_transfer,jazzcash,easypaisa',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 400);
            }

            // Get room category and verify availability
            $roomCategory = RoomCategory::with('property')->find($request->room_category_id);
            if (!$roomCategory) {
                return response()->json(['error' => 'Room category not found'], 404);
            }

            // Check if property is active
            if (!$roomCategory->property->is_active) {
                return response()->json(['error' => 'Property is not available for booking'], 400);
            }

            // Check for booking conflicts
            $hasConflict = Booking::where('room_category_id', $request->room_category_id)
                               ->where('status', '!=', 'CANCELLED')
                               ->where(function($q) use ($request) {
                                   $q->whereBetween('start_at', [$request->start_at, $request->end_at])
                                     ->orWhereBetween('end_at', [$request->start_at, $request->end_at])
                                     ->orWhere(function($q2) use ($request) {
                                         $q2->where('start_at', '<=', $request->start_at)
                                            ->where('end_at', '>=', $request->end_at);
                                     });
                               })
                               ->exists();

            if ($hasConflict) {
                return response()->json(['error' => 'Room is not available for the selected time period'], 400);
            }

            // Calculate total price based on stay type
            $totalPrice = $this->calculatePrice($roomCategory, $request->stay_type);

            $booking = Booking::create([
                'room_category_id' => $request->room_category_id,
                'user_id' => Auth::id() ?? null, // Optional for guest bookings
                'customer_name' => $request->customer_name,
                'customer_email' => $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'guests' => $request->guests,
                'stay_type' => $request->stay_type,
                'start_at' => $request->start_at,
                'end_at' => $request->end_at,
                'currency' => $request->get('currency', 'PKR'),
                'payment_method' => $request->payment_method,
            ]);

            // Set calculated total price (guarded attribute)
            $booking->total_price = $totalPrice;
            $booking->status = 'PENDING';
            $booking->save();

            return response()->json([
                'message' => 'Booking created successfully',
                'booking' => $booking
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * Calculate price based on stay type
     */
    private function calculatePrice(RoomCategory $roomCategory, string $stayType): float
    {
        switch ($stayType) {
            case '4h':
                return (float) $roomCategory->price_per_4_hours;
            case '6h':
                return (float) $roomCategory->price_per_6_hours;
            case '12h':
                return (float) $roomCategory->price_per_12_hours;
            case '24h':
                return (float) $roomCategory->price_per_24_hours;
            default:
                return (float) $roomCategory->price_per_4_hours;
        }
    }
}
