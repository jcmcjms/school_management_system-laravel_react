<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku')->unique();
            $table->string('category');
            $table->decimal('current_quantity', 10, 3)->default(0);
            $table->decimal('minimum_quantity', 10, 3)->default(0);
            $table->string('unit')->default('kg');
            $table->decimal('unit_cost', 10, 2)->nullable();
            $table->foreignId('supplier_id')->nullable()->references('id')->on('suppliers')->nullOnDelete();
            $table->boolean('low_stock_alert')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->references('id')->on('inventory_items')->cascadeOnDelete();
            $table->foreignId('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->enum('type', ['addition', 'deduction', 'adjustment', 'wastage']);
            $table->decimal('quantity', 10, 3);
            $table->decimal('quantity_before', 10, 3);
            $table->decimal('quantity_after', 10, 3);
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('inventory_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->references('id')->on('inventory_items')->cascadeOnDelete();
            $table->enum('alert_type', ['low_stock', 'out_of_stock', 'expiring']);
            $table->enum('status', ['pending', 'acknowledged', 'resolved'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamps();
        });

        Schema::create('menu_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->references('id')->on('menu_categories')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('image_url')->nullable();
            $table->integer('available_quantity')->default(0);
            $table->integer('reserved_quantity')->default(0);
            $table->integer('low_stock_threshold')->default(5);
            $table->enum('availability_status', ['available', 'limited', 'sold_out'])->default('available');
            $table->json('allergens')->nullable();
            $table->json('nutritional_info')->nullable();
            $table->time('daily_start_time')->nullable();
            $table->time('daily_end_time')->nullable();
            $table->boolean('is_available')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('menu_item_ingredients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_item_id')->references('id')->on('menu_items')->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->nullable()->references('id')->on('inventory_items')->nullOnDelete();
            $table->string('ingredient_name');
            $table->decimal('quantity_required', 10, 3)->default(0);
            $table->string('unit')->default('kg');
            $table->timestamps();
        });
    }

public function down(): void
    {
        Schema::dropIfExists('menu_item_ingredients');
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('menu_categories');
        Schema::dropIfExists('inventory_alerts');
        Schema::dropIfExists('inventory_transactions');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('suppliers');
    }
};