<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(['email' => 'admin@example.com'], [
            'name' => 'Admin User',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'employee_id' => 'EMP001',
            'department' => 'Administration',
            'position' => 'System Administrator',
            'is_active' => true,
        ]);

        User::firstOrCreate(['email' => 'manager@example.com'], [
            'name' => 'Manager User',
            'password' => Hash::make('password'),
            'role' => 'manager',
            'employee_id' => 'EMP002',
            'department' => 'Operations',
            'position' => 'Restaurant Manager',
            'salary_deduction_limit' => 5000.00,
            'is_active' => true,
        ]);

        User::firstOrCreate(['email' => 'staff@example.com'], [
            'name' => 'Staff User',
            'password' => Hash::make('password'),
            'role' => 'staff',
            'employee_id' => 'EMP003',
            'department' => 'Kitchen',
            'position' => 'Kitchen Staff',
            'salary_deduction_limit' => 3000.00,
            'is_active' => true,
        ]);

        User::firstOrCreate(['email' => 'librarian@example.com'], [
            'name' => 'Librarian User',
            'password' => Hash::make('password'),
            'role' => 'librarian',
            'employee_id' => 'LIB001',
            'department' => 'Library',
            'position' => 'Librarian',
            'salary_deduction_limit' => 2000.00,
            'is_active' => true,
        ]);

        User::firstOrCreate(['email' => 'faculty@example.com'], [
            'name' => 'Faculty User',
            'password' => Hash::make('password'),
            'role' => 'faculty',
            'employee_id' => 'EMP004',
            'department' => 'Faculty',
            'position' => 'Teacher',
            'salary_deduction_limit' => 2000.00,
            'salary_deduction_current' => 150.00,
            'is_active' => true,
        ]);

        User::firstOrCreate(['email' => 'student@example.com'], [
            'name' => 'Student User',
            'password' => Hash::make('password'),
            'role' => 'student',
            'student_id' => 'STU001',
            'grade_level' => 'Grade 11',
            'section' => 'A',
            'is_active' => true,
        ]);

        $student = User::where('student_id', 'STU001')->first();
        User::firstOrCreate(['email' => 'parent@example.com'], [
            'name' => 'Parent User',
            'password' => Hash::make('password'),
            'role' => 'parent',
            'parent_id' => 'PAR001',
            'linked_student_id' => $student?->id,
            'is_active' => true,
        ]);
    }
}