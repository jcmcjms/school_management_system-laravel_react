<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'employee_id' => 'EMP001',
            'department' => 'Administration',
            'position' => 'System Administrator',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'password' => Hash::make('password'),
            'role' => 'manager',
            'employee_id' => 'EMP002',
            'department' => 'Operations',
            'position' => 'Restaurant Manager',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Staff User',
            'email' => 'staff@example.com',
            'password' => Hash::make('password'),
            'role' => 'staff',
            'employee_id' => 'EMP003',
            'department' => 'Kitchen',
            'position' => 'Kitchen Staff',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Faculty User',
            'email' => 'faculty@example.com',
            'password' => Hash::make('password'),
            'role' => 'faculty',
            'employee_id' => 'EMP004',
            'department' => 'Faculty',
            'position' => 'Teacher',
            'salary_deduction_limit' => 2000.00,
            'salary_deduction_current' => 150.00,
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Student User',
            'email' => 'student@example.com',
            'password' => Hash::make('password'),
            'role' => 'student',
            'student_id' => 'STU001',
            'grade_level' => 'Grade 11',
            'section' => 'A',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Parent User',
            'email' => 'parent@example.com',
            'password' => Hash::make('password'),
            'role' => 'parent',
            'student_id' => 'STU001',
            'is_active' => true,
        ]);
    }
}