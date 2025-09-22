<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PropertyOwnerController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PublicController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('admin-login', [AuthController::class, 'login']);
    Route::post('property-owner-login', [AuthController::class, 'login']);
    Route::post('customer-login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
});

// Public routes (no authentication required)
Route::get('users/{id}', [PublicController::class, 'getUser']);
Route::get('cities', [PublicController::class, 'getCities']);
Route::get('cities/{identifier}', [PublicController::class, 'getCity']);
Route::get('property-categories', [PublicController::class, 'getPropertyCategories']);
Route::get('property-categories/{identifier}', [PublicController::class, 'getPropertyCategory']);
Route::get('properties', [PublicController::class, 'getProperties']);
Route::get('properties/{identifier}', [PublicController::class, 'getProperty']);
Route::get('properties/{propertyId}/room-categories', [PublicController::class, 'getPropertyRoomCategories']);
Route::get('room-categories/{id}', [PublicController::class, 'getRoomCategory']);
Route::get('testimonials', [PublicController::class, 'getTestimonials']);
Route::get('blogs', [PublicController::class, 'getBlogs']);
Route::get('blogs/{identifier}', [PublicController::class, 'getBlog']);

// Image handling route
Route::get('images/{path}', [PublicController::class, 'getImage'])->where('path', '.*');

// Booking routes (for customers)
Route::post('bookings', [BookingController::class, 'createBooking']);

// Admin routes (requires admin role)
Route::prefix('admin')->middleware(['auth', 'role:admin'])->group(function () {
    Route::get('dashboard-stats', [AdminController::class, 'getDashboardStats']);
    Route::get('users', [AdminController::class, 'getUsers']);
    Route::get('users/role/{role}', [AdminController::class, 'getUsersByRole']);
    Route::post('users', [AdminController::class, 'createUser']);
    Route::patch('users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('users/{id}', [AdminController::class, 'deleteUser']);
    
    Route::get('cities', [AdminController::class, 'getCities']);
    Route::post('cities', [AdminController::class, 'createCity']);
    Route::patch('cities/{id}', [AdminController::class, 'updateCity']);
    Route::delete('cities/{id}', [AdminController::class, 'deleteCity']);
    
    Route::get('property-categories', [AdminController::class, 'getPropertyCategories']);
    Route::post('property-categories', [AdminController::class, 'createPropertyCategory']);
    Route::patch('property-categories/{id}', [AdminController::class, 'updatePropertyCategory']);
    Route::delete('property-categories/{id}', [AdminController::class, 'deletePropertyCategory']);
    
    Route::get('properties', [AdminController::class, 'getProperties']);
    Route::patch('properties/{id}/status', [AdminController::class, 'updatePropertyStatus']);
    
    Route::get('bookings', [AdminController::class, 'getBookings']);
    Route::patch('bookings/{id}/status', [AdminController::class, 'updateBookingStatus']);
    
    Route::get('vendors', [AdminController::class, 'getVendors']);
    Route::patch('vendors/{id}/status', [AdminController::class, 'updateVendorStatus']);
    
    Route::get('blogs', [AdminController::class, 'getBlogs']);
    Route::post('blogs', [AdminController::class, 'createBlog']);
    Route::patch('blogs/{id}', [AdminController::class, 'updateBlog']);
    Route::delete('blogs/{id}', [AdminController::class, 'deleteBlog']);
    
    Route::get('testimonials', [AdminController::class, 'getTestimonials']);
    Route::post('testimonials', [AdminController::class, 'createTestimonial']);
    Route::patch('testimonials/{id}', [AdminController::class, 'updateTestimonial']);
    Route::delete('testimonials/{id}', [AdminController::class, 'deleteTestimonial']);
});

// Property Owner routes (requires property_owner role)
Route::prefix('property-owner')->middleware(['auth', 'role:property_owner'])->group(function () {
    Route::get('dashboard-stats', [PropertyOwnerController::class, 'getDashboardStats']);
    Route::get('properties', [PropertyOwnerController::class, 'getMyProperties']);
    Route::post('properties', [PropertyOwnerController::class, 'createProperty']);
    Route::get('properties/{id}', [PropertyOwnerController::class, 'getMyProperty']);
    Route::patch('properties/{id}', [PropertyOwnerController::class, 'updateProperty']);
    Route::delete('properties/{id}', [PropertyOwnerController::class, 'deleteProperty']);
    
    Route::get('properties/{propertyId}/room-categories', [PropertyOwnerController::class, 'getPropertyRoomCategories']);
    Route::post('properties/{propertyId}/room-categories', [PropertyOwnerController::class, 'createRoomCategory']);
    Route::patch('room-categories/{id}', [PropertyOwnerController::class, 'updateRoomCategory']);
    Route::delete('room-categories/{id}', [PropertyOwnerController::class, 'deleteRoomCategory']);
    
    Route::get('bookings', [PropertyOwnerController::class, 'getMyBookings']);
    Route::patch('bookings/{id}/status', [PropertyOwnerController::class, 'updateBookingStatus']);
    
    Route::get('imported-calendars', [PropertyOwnerController::class, 'getImportedCalendars']);
    Route::post('imported-calendars', [PropertyOwnerController::class, 'importCalendar']);
    Route::delete('imported-calendars/{id}', [PropertyOwnerController::class, 'deleteImportedCalendar']);
});

// Customer routes (for authenticated customers)
Route::middleware(['auth', 'role:customer'])->group(function () {
    Route::get('my-bookings', [BookingController::class, 'getMyBookings']);
    Route::get('bookings/{id}', [BookingController::class, 'getBooking']);
});