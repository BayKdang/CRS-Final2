<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;

class UserBookingController extends Controller
{
    /**
     * Get bookings for the authenticated user
     */
    public function getUserBookings(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $status = $request->query('status');
        
        $query = Booking::where('user_id', $request->user()->id)
            ->with(['car', 'car.brand', 'car.category'])
            ->orderBy('created_at', 'desc');
            
        // Filter by status if provided
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }
        
        $bookings = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $bookings->items(),
            'meta' => [
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
                'per_page' => $bookings->perPage(),
                'total' => $bookings->total()
            ]
        ]);
    }
}