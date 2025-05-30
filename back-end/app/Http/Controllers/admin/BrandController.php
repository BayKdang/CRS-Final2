<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class BrandController extends Controller
{
    public function index()
    {
        try {
            // Log the request for debugging
            Log::info('BrandController@index: Fetching all brands');
            
            // Check if Brand model exists
            if (!class_exists(Brand::class)) {
                Log::error('BrandController@index: Brand model does not exist');
                return response()->json([
                    'status' => 500,
                    'message' => 'Server error: Brand model not found'
                ], 500);
            }
            
            // Try to get all brands
            $brands = Brand::all();
            
            Log::info('BrandController@index: Successfully fetched brands', [
                'count' => $brands->count()
            ]);
            
            return response()->json([
                'status' => 200,
                'data' => $brands
            ]);
        } catch (\Exception $e) {
            Log::error('BrandController@index: Exception', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'status' => 500,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request){
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors()
            ],400);
        }
        
        $brand = new Brand();
        $brand->name = $request->name;
        $brand->status = $request->status;
        
        // Handle logo upload
        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/brands'), $filename);
            $brand->logo = 'uploads/brands/' . $filename;
        }
        
        $brand->save();
        
        return response()->json([
            'status' => 200,
            'message' => 'Brand Added Successfully',
            'data' => $brand
        ],200);
    }

    public function show($id){
        $brands = Brand::find($id);

        if($brands == null){
            return response()->json([
                'status'=> 404,
                'message' => 'Brand Not Found',
                'data' => []
            ], 404);
        }
        return response()->json([
            'status'=> 200,
            'data' => $brands
        ]);
    }
    
    public function update($id, Request $request){
        $brand = Brand::find($id);

        if($brand == null){
            return response()->json([
                'status'=> 404,
                'message' => 'Brand Not Found',
                'data' => []
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors()
            ],400);
        }
        
        $brand->name = $request->name;
        $brand->status = $request->status;
        
        // Handle logo upload for update
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($brand->logo && file_exists(public_path($brand->logo))) {
                unlink(public_path($brand->logo));
            }
            
            $file = $request->file('logo');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/brands'), $filename);
            $brand->logo = 'uploads/brands/' . $filename;
        }
        
        $brand->save();

        return response()->json([
            'status' => 200,
            'message' => 'Brand Updated Successfully',
            'data' => $brand
        ],200);
    }

    public function destroy($id){
        $brand = Brand::find($id);

        if($brand == null){
            return response()->json([
                'status'=> 404,
                'message' => 'Brand Not Found',
                'data' => []
            ], 404);
        }

        // Delete logo file if exists
        if ($brand->logo && file_exists(public_path($brand->logo))) {
            unlink(public_path($brand->logo));
        }
        
        $brand->delete();
        
        return response()->json([
            'status' => 200,
            'message' => 'Brand Deleted Successfully',
        ],200);
    }
}
