<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'car_id',
        'pickup_date',
        'return_date',
        'pickup_location',
        'return_location',
        'customer_name',
        'customer_email',
        'customer_phone',
        'notes',
        'subtotal',
        'tax_amount',
        'total_price',
        'status',
        'payment_status',
        'transaction_id',
        'confirmed_at',
        'pickup_at',
        'returned_at',
        'cancelled_at',
        'cancellation_reason'
    ];

    protected $casts = [
        'pickup_date' => 'datetime',
        'return_date' => 'datetime',
        'confirmed_at' => 'datetime',
        'pickup_at' => 'datetime',
        'returned_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    // Relationship to User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relationship to Car
    public function car()
    {
        return $this->belongsTo(Car::class);
    }

    // Calculate rental duration in days
    public function getDurationAttribute()
    {
        return $this->pickup_date->diffInDays($this->return_date) + 1;
    }
}