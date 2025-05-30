<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Car;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    /**
     * Check if a car is available for the requested dates
     */
    public function checkAvailability(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'car_id' => 'required|exists:cars,id',
            'pickup_date' => 'required|date|after_or_equal:today',
            'return_date' => 'required|date|after:pickup_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $car_id = $request->car_id;
        $pickup_date = $request->pickup_date;
        $return_date = $request->return_date;
        
        // Check for conflicting bookings
        $conflicts = Booking::where('car_id', $car_id)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($pickup_date, $return_date) {
                $query->whereBetween('pickup_date', [$pickup_date, $return_date])
                    ->orWhereBetween('return_date', [$pickup_date, $return_date])
                    ->orWhere(function ($query) use ($pickup_date, $return_date) {
                        $query->where('pickup_date', '<=', $pickup_date)
                              ->where('return_date', '>=', $return_date);
                    });
            })->exists();
        
        return response()->json([
            'available' => !$conflicts,
            'message' => $conflicts ? 'Car is not available for selected dates' : 'Car is available'
        ]);
    }

    /**
     * Create a new booking (initial pending state)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'car_id' => 'required|exists:cars,id',
            'pickup_date' => 'required|date|after_or_equal:today',
            'return_date' => 'required|date|after:pickup_date',
            'pickup_location' => 'required|string',
            'return_location' => 'required|string',
            'customer_name' => 'required|string',
            'customer_email' => 'required|email',
            'customer_phone' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // First check availability
        $car_id = $request->car_id;
        $pickup_date = $request->pickup_date;
        $return_date = $request->return_date;
        
        // Check for conflicting bookings
        $conflicts = Booking::where('car_id', $car_id)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($pickup_date, $return_date) {
                $query->whereBetween('pickup_date', [$pickup_date, $return_date])
                    ->orWhereBetween('return_date', [$pickup_date, $return_date])
                    ->orWhere(function ($query) use ($pickup_date, $return_date) {
                        $query->where('pickup_date', '<=', $pickup_date)
                              ->where('return_date', '>=', $return_date);
                    });
            })->exists();
            
        if ($conflicts) {
            return response()->json([
                'success' => false,
                'message' => 'Car is not available for the selected dates'
            ], 422);
        }

        // Calculate price
        $car = Car::findOrFail($car_id);
        $days = (strtotime($return_date) - strtotime($pickup_date)) / (60 * 60 * 24);
        $days = ceil($days); // Round up to full days
        
        $subtotal = $car->price * $days;
        $tax_amount = $subtotal * 0.1; // 10% tax
        $total_price = $subtotal + $tax_amount;
        
        try {
            // Create booking
            $booking = new Booking();
            $booking->user_id = Auth::id();
            $booking->car_id = $car_id;
            $booking->pickup_date = $pickup_date;
            $booking->return_date = $return_date;
            $booking->pickup_location = $request->pickup_location;
            $booking->return_location = $request->return_location;
            $booking->customer_name = $request->customer_name;
            $booking->customer_email = $request->customer_email;
            $booking->customer_phone = $request->customer_phone;
            $booking->notes = $request->notes;
            $booking->subtotal = $subtotal;
            $booking->tax_amount = $tax_amount;
            $booking->total_price = $total_price;
            $booking->status = 'pending';
            $booking->payment_status = 'pending';
            $booking->save();
            
            return response()->json([
                'success' => true,
                'data' => $booking,
                'message' => 'Booking created successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating your booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process payment and confirm booking
     */
    public function processPayment(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        
        // Ensure booking belongs to authenticated user
        if ($booking->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        // In a real app, process payment here
        // For simulation, we'll just create a fake transaction ID
        $transaction_id = 'TXN' . time() . rand(1000, 9999);
        
        // Update booking status
        $booking->status = 'confirmed';
        $booking->payment_status = 'paid';
        $booking->transaction_id = $transaction_id;
        $booking->confirmed_at = now();
        $booking->save();
        
        return response()->json([
            'success' => true,
            'data' => $booking,
            'message' => 'Payment processed successfully'
        ]);
    }

    /**
     * Get booking by ID
     */
    public function show($id)
    {
        $booking = Booking::with('car.brand', 'car.category')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->first();
            
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
     * Get bookings for authenticated user
     */
    public function index()
    {
        $bookings = Booking::with('car')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }

    /**
     * Cancel a booking
     */
    public function cancel($id, Request $request)
    {
        $booking = Booking::findOrFail($id);
        
        // Ensure booking belongs to authenticated user
        if ($booking->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        // Only allow cancellation if status is pending or confirmed
        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Booking cannot be cancelled'
            ], 422);
        }
        
        // Update booking
        $booking->status = 'cancelled';
        $booking->cancellation_reason = $request->reason; 
        $booking->cancelled_at = now();
        $booking->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully'
        ]);
    }
}
