<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL requires dropping and recreating enum columns
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE menu_items MODIFY COLUMN availability_status ENUM('available', 'limited', 'sold_out', 'hidden') DEFAULT 'available'");
        } elseif (DB::getDriverName() === 'sqlite') {
            // SQLite doesn't support enum, it's just TEXT - no change needed
        } elseif (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE menu_items ALTER COLUMN availability_status TYPE VARCHAR(20)");
            DB::statement("ALTER TABLE menu_items ALTER COLUMN availability_status DROP DEFAULT");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE menu_items MODIFY COLUMN availability_status ENUM('available', 'limited', 'sold_out') DEFAULT 'available'");
        }
    }
};