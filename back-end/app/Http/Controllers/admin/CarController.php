<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Car;
use App\Models\Brand;
use App\Models\Category;
use Illuminate\Support\Facades\Validator;

class CarController extends Controller
{
    public function index()
    {
        $cars = Car::with(['brand', 'category'])->orderBy('created_at', 'DESC')->get();
        
        // Format the response to include brand and category names
        $formattedCars = $cars->map(function ($car) {
            return [
                'id' => $car->id,
                'name' => $car->name,
                'brand' => $car->brand,
                'brand_id' => $car->brand_id,
                'category' => $car->category,
                'category_id' => $car->category_id,
                'year' => $car->year,
                'price' => $car->price,
                'status' => $car->status,
                'description' => $car->description,
                'fuel_type' => $car->fuel_type,
                'transmission' => $car->transmission,
                'mileage' => $car->mileage,
                'condition' => $car->condition,
                'featured' => $car->featured,
                'image' => $car->image,
                'created_at' => $car->created_at,
                'updated_at' => $car->updated_at,
            ];
        });
        
        return response()->json([
            'status' => 200,
            'data' => $formattedCars
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:available,rented,maintenance',
            'description' => 'nullable|string',
            'fuel_type' => 'nullable|string',
            'transmission' => 'nullable|string',
            'mileage' => 'nullable|string',
            'condition' => 'required|in:New,Used',
            'featured' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors()
            ], 400);
        }
        
        $car = new Car();
        $car->name = $request->name;
        $car->brand_id = $request->brand_id;
        $car->category_id = $request->category_id;
        $car->year = $request->year;
        $car->price = $request->price;
        $car->status = $request->status;
        $car->description = $request->description;
        $car->fuel_type = $request->fuel_type;
        $car->transmission = $request->transmission;
        $car->mileage = $request->mileage;
        $car->featured = $request->has('featured') ? (bool)$request->featured : false;
        $car->condition = $request->condition;
        
        // Handle image upload
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/cars'), $filename);
            $car->image = 'uploads/cars/' . $filename;
        }
        
        $car->save();
        
        return response()->json([
            'status' => 200,
            'message' => 'Car Added Successfully',
            'data' => $car
        ], 200);
    }

    public function show($id)
    {
        try {
            $car = Car::with(['brand', 'category'])->find($id);

            if (!$car) {
                return response()->json([
                    'status' => 404,
                    'message' => 'Car Not Found',
                    'data' => null
                ], 404);
            }

            return response()->json([
                'status' => 200,
                'data' => $car
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => 'Server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update($id, Request $request)
    {
        $car = Car::find($id);

        if (!$car) {
            return response()->json([
                'status' => 404,
                'message' => 'Car Not Found',
                'data' => []
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'brand_id' => 'required|exists:brands,id',
            'category_id' => 'required|exists:categories,id',
            'year' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:available,rented,maintenance',
            'description' => 'nullable|string',
            'fuel_type' => 'nullable|string',
            'transmission' => 'nullable|string',
            'mileage' => 'nullable|string',
            'condition' => 'required|in:New,Used',
            'featured' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors()
            ], 400);
        }

        $car->name = $request->name;
        $car->brand_id = $request->brand_id;
        $car->category_id = $request->category_id;
        $car->year = $request->year;
        $car->price = $request->price;
        $car->status = $request->status;
        $car->description = $request->description;
        $car->fuel_type = $request->fuel_type;
        $car->transmission = $request->transmission;
        $car->mileage = $request->mileage;
        $car->featured = $request->has('featured') ? (bool)$request->featured : $car->featured;
        $car->condition = $request->condition;
        
        // Handle image upload
        if ($request->hasFile('image')) {
            // Remove old image if it exists
            if ($car->image && file_exists(public_path($car->image))) {
                unlink(public_path($car->image));
            }
            
            $file = $request->file('image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/cars'), $filename);
            $car->image = 'uploads/cars/' . $filename;
        }
        
        $car->save();
        
        return response()->json([
            'status' => 200,
            'message' => 'Car Updated Successfully',
            'data' => $car
        ], 200);
    }

    public function destroy($id)
    {
        $car = Car::find($id);

        if (!$car) {
            return response()->json([
                'status' => 404,
                'message' => 'Car Not Found',
                'data' => []
            ], 404);
        }

        // Delete image file if it exists
        if ($car->image && file_exists(public_path($car->image))) {
            unlink(public_path($car->image));
        }
        
        $car->delete();
        
        return response()->json([
            'status' => 200,
            'message' => 'Car Deleted Successfully'
        ], 200);
    }

    public function getFeaturedCars()
{
    $featuredCars = Car::with(['brand', 'category'])
        ->where('featured', true)
        ->where('status', 'available')
        ->orderBy('created_at', 'DESC')
        ->get();
    
    // Format the response to include brand and category names
    $formattedCars = $featuredCars->map(function ($car) {
        return [
            'id' => $car->id,
            'name' => $car->name,
            'brand' => $car->brand ? $car->brand->name : null,
            'brand_id' => $car->brand_id,
            'category' => $car->category ? $car->category->name : null,
            'category_id' => $car->category_id,
            'year' => $car->year,
            'price' => $car->price,
            'status' => $car->status,
            'description' => $car->description,
            'fuel_type' => $car->fuel_type,
            'transmission' => $car->transmission,
            'mileage' => $car->mileage,
            'condition' => $car->condition,
            'featured' => $car->featured,
            'image' => $car->image,
            'created_at' => $car->created_at,
            'updated_at' => $car->updated_at,
        ];
    });
    
    return response()->json([
        'status' => 200,
        'data' => $formattedCars
    ]);
}
}