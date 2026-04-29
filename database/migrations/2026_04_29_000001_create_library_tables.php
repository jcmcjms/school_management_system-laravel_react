<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('library_categories')->onDelete('set null');
            $table->timestamps();
        });

        Schema::create('library_books', function (Blueprint $table) {
            $table->id();
            $table->string('isbn')->unique();
            $table->string('title');
            $table->string('author');
            $table->string('publisher')->nullable();
            $table->year('published_year')->nullable();
            $table->foreignId('category_id')->nullable()->constrained('library_categories')->onDelete('set null');
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->integer('total_copies')->default(1);
            $table->integer('available_copies')->default(1);
            $table->string('location')->nullable();
            $table->enum('status', ['available', 'unavailable', 'archived'])->default('available');
            $table->timestamps();
        });

        Schema::create('library_borrowings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained('library_books')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->date('borrowed_at');
            $table->date('due_date');
            $table->date('returned_at')->nullable();
            $table->enum('status', ['borrowed', 'returned', 'overdue', 'lost'])->default('borrowed');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('library_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained('library_books')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('reserved_at')->useCurrent();
            $table->timestamp('expires_at')->useCurrent();
            $table->timestamp('fulfilled_at')->nullable();
            $table->enum('status', ['pending', 'fulfilled', 'expired', 'cancelled'])->default('pending');
            $table->timestamps();
        });

        Schema::create('library_fines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('borrowing_id')->constrained('library_borrowings')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'paid', 'waived'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_fines');
        Schema::dropIfExists('library_reservations');
        Schema::dropIfExists('library_borrowings');
        Schema::dropIfExists('library_books');
        Schema::dropIfExists('library_categories');
    }
};