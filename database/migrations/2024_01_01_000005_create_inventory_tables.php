<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tables already created in 2024_01_01_000001_create_menu_tables.php
        // This migration is kept for backwards compatibility
    }

    public function down(): void
    {
        // Tables already dropped in 2024_01_01_000001_create_menu_tables.php
    }
};