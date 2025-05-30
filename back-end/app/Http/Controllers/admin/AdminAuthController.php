<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AdminAuthController extends Controller
{
    public function authenticate(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 422,
                    'message' => $validator->errors()->first()
                ], 422);
            }

            // Check credentials
            if (!Auth::attempt($request->only('email', 'password'))) {
                return response()->json([
                    'status' => 401,
                    'message' => 'Invalid login credentials'
                ], 401);
            }

            // Get authenticated user
            $user = User::where('email', $request->email)->first();

            // Check if user is admin
            if ($user->role !== 'admin') {
                return response()->json([
                    'status' => 403,
                    'message' => 'You do not have admin privileges'
                ], 403);
            }

            // Create token
            $token = $user->createToken('admin-auth-token')->plainTextToken;

            return response()->json([
                'status' => 200,
                'message' => 'Admin login successful',
                'token' => $token,
                'user' => $user
            ]);
        } catch (\Exception $e) {
            // Log error for debugging
            \Log::error('Admin login error: ' . $e->getMessage());
            
            return response()->json([
                'status' => 500,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }
}