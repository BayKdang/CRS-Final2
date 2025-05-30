<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Car extends Model
{
    protected $fillable = [
        'name', 
        'brand_id', 
        'category_id', 
        'year', 
        'price', 
        'status', 
        'description', 
        'fuel_type', 
        'transmission', 
        'mileage', 
        'condition',
        'featured',
        'image'
    ];
    
    /**
     * Get the brand that owns the car.
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }
    
    /**
     * Get the category that owns the car.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}