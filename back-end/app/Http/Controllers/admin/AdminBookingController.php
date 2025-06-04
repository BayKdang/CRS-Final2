<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Car;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminBookingController extends Controller
{
    /**
     * Get all bookings with optional filtering
     */
    public function index(Request $request)
    {
        $query = Booking::with(['car.brand', 'car.category', 'user'])
            ->orderBy('created_at', 'desc');
        
        // Apply filters if provided
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('from_date') && $request->from_date) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        
        if ($request->has('to_date') && $request->to_date) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }
        
        $bookings = $query->get();
        
        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }
    
    /**
     * Get booking details by ID
     */
    public function show($id)
    {
        $booking = Booking::with(['car.brand', 'car.category', 'user'])
            ->find($id);
            
        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $booking
        ]);
    }
    
    /**
     * Update booking status
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            // Find the booking
            $booking = Booking::findOrFail($id);
            
            // Validate request
            $validator = Validator::make($request->all(), [
                'status' => 'sometimes|required|in:pending,confirmed,active,completed,cancelled',
                'payment_status' => 'sometimes|required|in:pending,paid,refunded',
                'reason' => 'nullable|string'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Get the car
            $car = null;
            if ($booking->car_id) {
                $car = Car::find($booking->car_id);
            }
            
            // Handle status update
            if ($request->has('status')) {
                $old_status = $booking->status;
                $new_status = $request->status;
                
                // Set booking status and related timestamps
                $booking->status = $new_status;
                
                // Handle different status transitions
                if ($new_status === 'confirmed' && $old_status !== 'confirmed') {
                    $booking->confirmed_at = now();
                    
                    // Mark car as reserved if not already
                    if ($car && $car->status !== 'reserved') {
                        $car->status = 'reserved';
                        $car->save();
                    }
                } 
                elseif ($new_status === 'active' && $old_status !== 'active') {
                    $booking->pickup_at = now();
                    
                    // Mark car as rented
                    if ($car && $car->status !== 'rented') {
                        $car->status = 'rented';
                        $car->save();
                    }
                } 
                elseif ($new_status === 'completed' && $old_status !== 'completed') {
                    $booking->returned_at = now();
                    
                    // Mark car as available again
                    if ($car && $car->status !== 'available') {
                        $car->status = 'available';
                        $car->save();
                    }
                } 
                elseif ($new_status === 'cancelled' && $old_status !== 'cancelled') {
                    $booking->cancelled_at = now();
                    $booking->cancellation_reason = $request->reason ?? 'No reason provided';
                    
                    // Mark car as available again
                    if ($car && $car->status !== 'available') {
                        $car->status = 'available';
                        $car->save();
                    }
                }
            }
            
            // Handle payment status update
            if ($request->has('payment_status')) {
                $old_payment_status = $booking->payment_status;
                $new_payment_status = $request->payment_status;
                
                $booking->payment_status = $new_payment_status;
                
                // Mark payment time if paid for the first time
                if ($new_payment_status === 'paid' && $old_payment_status !== 'paid') {
                    $booking->paid_at = now();
                    
                    // If booking is pending and payment is now marked as paid, also mark as confirmed
                    if ($booking->status === 'pending') {
                        $booking->status = 'confirmed';
                        $booking->confirmed_at = now();
                        
                        // Update car status to reserved
                        if ($car && $car->status !== 'reserved') {
                            $car->status = 'reserved';
                            $car->save();
                        }
                    }
                }
            }
            
            // Save booking changes
            $booking->save();
            
            // Reload booking with relationships
            $booking = Booking::with(['car.brand', 'car.category', 'user'])
                ->find($id);
            
            return response()->json([
                'success' => true,
                'data' => $booking,
                'message' => 'Booking updated successfully'
            ]);
        } 
        catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('Error updating booking: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error updating booking: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get booking statistics for admin dashboard
     */
    public function getStats()
    {
        // Total bookings
        $totalBookings = Booking::count();
        
        // Active bookings
        $activeBookings = Booking::where('status', 'active')->count();
        
        // Today's bookings
        $todayBookings = Booking::whereDate('created_at', today())->count();
        
        // This month's revenue
        $thisMonthRevenue = Booking::where('payment_status', 'paid')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_price');
        
        return response()->json([
            'success' => true,
            'data' => [
                'totalBookings' => $totalBookings,
                'activeBookings' => $activeBookings,
                'todayBookings' => $todayBookings,
                'thisMonthRevenue' => $thisMonthRevenue
            ]
        ]);
    }
}
