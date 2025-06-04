<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers
     */
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);
        
        $query = User::query()
            ->where('role', 'user') // Assuming 'role' column to filter regular users
            ->withCount('bookings'); // Count bookings for each user
            
        // Apply search filters if provided
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }
        
        $customers = $query->orderBy('created_at', 'desc')
                          ->paginate($perPage);
        
        return response()->json($customers);
    }

    /**
     * Display customer details
     */
    public function show($id)
    {
        $customer = User::where('role', 'user')
                      ->withCount('bookings')
                      ->findOrFail($id);
        
        return response()->json([
            'data' => $customer
        ]);
    }
}