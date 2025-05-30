<?php


namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->user() || auth()->user()->role !== 'admin') {
            return response()->json([
                'status' => 403,
                'message' => 'You do not have admin privileges'
            ], 403);
        }

        return $next($request);
    }
}