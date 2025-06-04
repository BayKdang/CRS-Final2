<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\admin\AdminAuthController;
use App\Http\Controllers\admin\BrandController;
use App\Http\Controllers\admin\CategoryController;
use App\Http\Controllers\admin\CarController;
use App\Http\Controllers\admin\AdminBookingController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\UserBookingController;

// Public routes - no authentication needed
Route::get('/cars', [CarController::class, 'index']);
Route::get('/cars/{id}', [CarController::class, 'show']);
Route::get('/featured-cars', [CarController::class, 'getFeaturedCars']);

// Public access to view brands and categories
Route::get('/brands', [BrandController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);

// User authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected user routes - require user login
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user/profile', [AuthController::class, 'profile']);

    // Booking routes
    Route::post('/check-availability', [BookingController::class, 'checkAvailability']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::get('/user/bookings', [BookingController::class, 'index']);
    Route::post('/bookings/{id}/payment', [BookingController::class, 'processPayment']);
    Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
});

// Admin authentication route
Route::post('/admin/login', [AdminAuthController::class, 'authenticate']);

// Protected admin routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Admin management endpoints - exclude the index methods to avoid conflicts
    Route::apiResource('brands', BrandController::class)->except(['index']);
    Route::apiResource('categories', CategoryController::class)->except(['index']);
    Route::apiResource('cars', CarController::class)->except(['index', 'show']);

    // Admin booking management
    Route::get('/admin/bookings', [AdminBookingController::class, 'index']);
    Route::get('/admin/bookings/{id}', [AdminBookingController::class, 'show']);
    Route::put('/admin/bookings/{id}/status', [AdminBookingController::class, 'updateStatus']);
    Route::get('/admin/booking-stats', [AdminBookingController::class, 'getStats']);

    // Admin customer management routes
    Route::get('/admin/customers', [App\Http\Controllers\Admin\CustomerController::class, 'index']);
    Route::get('/admin/customers/{id}', [App\Http\Controllers\Admin\CustomerController::class, 'show']);
});

// User profile and booking management
Route::middleware('auth:sanctum')->prefix('user')->group(function () {
    Route::get('/profile', [UserProfileController::class, 'getProfile']);
    Route::put('/profile', [UserProfileController::class, 'updateProfile']);
    Route::post('/change-password', [UserProfileController::class, 'changePassword']);
    Route::get('/bookings', [UserBookingController::class, 'getUserBookings']);
});