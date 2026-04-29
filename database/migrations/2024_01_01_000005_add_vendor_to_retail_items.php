<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('retail_items', function (Blueprint $table) {
            $table->foreignId('vendor_id')->nullable()->after('retail_category_id')->constrained('vendors')->nullOnDelete();
            $table->decimal('vendor_commission', 5, 2)->default(70)->after('status')->comment('Percentage for vendor');
        });
    }

    public function down(): void
    {
        Schema::table('retail_items', function (Blueprint $table) {
            $table->dropForeign(['vendor_id']);
            $table->dropColumn(['vendor_id', 'vendor_commission']);
        });
    }
};