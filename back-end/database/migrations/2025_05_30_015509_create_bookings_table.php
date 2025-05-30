<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('car_id')->constrained()->onDelete('restrict');
            $table->date('pickup_date');
            $table->date('return_date');
            $table->string('pickup_location');
            $table->string('return_location');
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone');
            $table->text('notes')->nullable();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax_amount', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->enum('status', ['pending', 'confirmed', 'active', 'completed', 'cancelled'])->default('pending');
            $table->enum('payment_status', ['pending', 'paid', 'refunded'])->default('pending');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('pickup_at')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};