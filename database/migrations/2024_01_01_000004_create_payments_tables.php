<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->foreignId('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->enum('payment_method', ['gcash', 'cash', 'salary_deduction']);
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded']);
            $table->string('gcash_reference')->nullable();
            $table->string('gcash_mobile_number')->nullable();
            $table->string('transaction_id')->nullable();
            $table->text('gcash_response')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('salary_deductions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreignId('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->decimal('running_total', 10, 2);
            $table->decimal('monthly_limit', 10, 2);
            $table->string('payroll_month');
            $table->string('payroll_year');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_deductions');
        Schema::dropIfExists('payments');
    }
};