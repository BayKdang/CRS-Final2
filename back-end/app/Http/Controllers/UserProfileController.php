<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use App\Models\User;

class UserProfileController extends Controller
{
    /**
     * Get the authenticated user's profile
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }
    
    /**
     * Update user profile information
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'dob' => 'nullable|date',
            'driving_license' => 'nullable|string|max:100',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);
        
        // Handle avatar upload if present
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar && Storage::exists($user->avatar)) {
                Storage::delete($user->avatar);
            }
            
            // Store new avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = 'storage/' . $avatarPath;
        }
        
        $user->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user
        ]);
    }
    
    /**
     * Change user password
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => [
                'required', 
                'string', 
                Password::min(8),
                'confirmed'
            ],
        ]);
        
        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'The provided current password is incorrect.'
            ], 422);
        }
        
        // Update password
        $user->update([
            'password' => Hash::make($validated['password'])
        ]);
        
        // Force token revoke on password change for security
        $user->tokens()->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully. Please login again with your new password.'
        ]);
    }
}