<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use Illuminate\Support\Facades\Validator;


class CategoryController extends Controller
{
    public function index(){
        $categories = Category::orderBy('created_at', 'DESC')->get();
        return response()->json([
            'status'=> 200,
            'data' => $categories
        ]);
    }

    public function store(Request $request){
        $validator = Validator::make($request->all(), [
            'name' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors()
            ],400);
        }
        $category = new Category();
        $category->name = $request->name;
        $category->status = $request->status;
        $category->save();
        return response()->json([
            'status' => 200,
            'message' => 'Category Added Successfully',
            'data' => $category
        ],200);


    }

    public function show($id){
        $categories = Category::find($id);

        if($categories == null){
            return response()->json([
                'status'=> 404,
                'message' => 'Category Not Found',
                'data' => []
            ], 404);
        }
        return response()->json([
            'status'=> 200,
            'data' => $categories
        ]);
    }
    public function update($id, Request $request){

        $category = Category::find($id);

        if($category == null){
            return response()->json([
                'status'=> 404,
                'message' => 'Category Not Found',
                'data' => []
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 400,
                'errors' => $validator->errors()
            ],400);
        }
        
        $category->name = $request->name;
        $category->status = $request->status;
        $category->save();


        return response()->json([
            'status' => 200,
            'message' => 'Category Updated Successfully',
            'data' => $category
        ],200);
    }

    public function destroy($id){

        $category = Category::find($id);

        if($category == null){
            return response()->json([
                'status'=> 404,
                'message' => 'Category Not Found',
                'data' => []
            ], 404);
        }

        $category->delete($id);
        return response()->json([
            'status' => 200,
            'message' => 'Category Deleted Successfully',
            
        ],200);

    }
}
