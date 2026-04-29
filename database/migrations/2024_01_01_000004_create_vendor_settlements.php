<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_settlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->date('settlement_date');
            $table->decimal('total_sales', 10, 2)->default(0);
            $table->integer('items_sold')->default(0);
            $table->decimal('vendor_share', 10, 2)->default(0); // vendor's cut (e.g., 70%)
            $table->decimal(' canteen_share', 10, 2)->default(0); // canteen's cut
            $table->integer('items_returned')->default(0);
            $table->string('status')->default('pending'); // pending, completed
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('vendor_sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total', 10, 2);
            $table->dateTime('sold_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_sales');
        Schema::dropIfExists('vendor_settlements');
    }
};