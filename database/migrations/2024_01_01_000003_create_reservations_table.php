<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->references('id')->on('orders')->nullOnDelete();
            $table->foreignId('menu_item_id')->references('id')->on('menu_items')->cascadeOnDelete();
            $table->integer('quantity')->default(1);
            $table->string('qr_code')->unique();
            $table->timestamp('qr_code_expires_at')->nullable();
            $table->time('reserved_pickup_time');
            $table->enum('status', ['pending', 'confirmed', 'redeemed', 'expired', 'cancelled'])->default('pending');
            $table->timestamp('redeemed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};