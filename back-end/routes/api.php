<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\admin\AdminAuthController;
use App\Http\Controllers\admin\BrandController;
use App\Http\Controllers\admin\CategoryController;
use App\Http\Controllers\admin\CarController;

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
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/user/bookings', [BookingController::class, 'index']);
});

// Admin authentication route
Route::post('/admin/login', [AdminAuthController::class, 'authenticate']);

// Protected admin routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Admin management endpoints - exclude the index methods to avoid conflicts
    Route::apiResource('brands', BrandController::class)->except(['index']);
    Route::apiResource('categories', CategoryController::class)->except(['index']);
    Route::apiResource('cars', CarController::class)->except(['index', 'show']);
});