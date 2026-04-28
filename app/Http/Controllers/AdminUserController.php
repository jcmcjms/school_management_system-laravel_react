<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('student_id', 'like', "%{$request->search}%")
                  ->orWhere('employee_id', 'like', "%{$request->search}%");
            });
        }

        if ($request->role) {
            $query->where('role', $request->role);
        }

        $users = $query->orderBy('name')->paginate(20);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role']),
            'roles' => User::ROLES,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', Password::defaults()],
            'role' => 'required|in:admin,manager,staff,student,parent,faculty',
            'student_id' => 'nullable|string|max:50',
            'grade_level' => 'nullable|string|max:50',
            'section' => 'nullable|string|max:50',
            'linked_student_id' => 'nullable|exists:users,id',
            'employee_id' => 'nullable|string|max:50',
            'department' => 'nullable|string|max:255',
            'salary_deduction_limit' => 'nullable|numeric|min:0',
            'position' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['salary_deduction_limit'] = $validated['salary_deduction_limit'] ?? 0;
        $validated['salary_deduction_current'] = 0;

        User::create($validated);

        return back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => "required|email|unique:users,email,{$user->id}",
            'password' => ['nullable', Password::defaults()],
            'role' => 'required|in:admin,manager,staff,student,parent,faculty',
            'student_id' => 'nullable|string|max:50',
            'grade_level' => 'nullable|string|max:50',
            'section' => 'nullable|string|max:50',
            'linked_student_id' => 'nullable|exists:users,id',
            'employee_id' => 'nullable|string|max:50',
            'department' => 'nullable|string|max:255',
            'salary_deduction_limit' => 'nullable|numeric|min:0',
            'position' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return back()->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['user' => 'You cannot delete your own account.']);
        }

        $user->delete();
        return back()->with('success', 'User deleted.');
    }

    public function importCsv(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $file = $request->file('csv_file');
        $handle = fopen($file->getRealPath(), 'r');

        // Read header row
        $headers = fgetcsv($handle);
        if (!$headers) {
            return back()->withErrors(['csv_file' => 'CSV file is empty.']);
        }

        $headers = array_map('strtolower', array_map('trim', $headers));

        $requiredHeaders = ['name', 'email', 'role'];
        foreach ($requiredHeaders as $req) {
            if (!in_array($req, $headers)) {
                fclose($handle);
                return back()->withErrors(['csv_file' => "Missing required column: {$req}"]);
            }
        }

        $created = 0;
        $errors = [];
        $row = 1;

        while (($data = fgetcsv($handle)) !== false) {
            $row++;
            $record = array_combine($headers, $data);

            if (!$record || empty($record['name']) || empty($record['email']) || empty($record['role'])) {
                $errors[] = "Row {$row}: Missing required fields.";
                continue;
            }

            if (!in_array($record['role'], array_keys(User::ROLES))) {
                $errors[] = "Row {$row}: Invalid role '{$record['role']}'.";
                continue;
            }

            if (User::where('email', $record['email'])->exists()) {
                $errors[] = "Row {$row}: Email '{$record['email']}' already exists.";
                continue;
            }

            User::create([
                'name' => $record['name'],
                'email' => $record['email'],
                'password' => Hash::make('password123'),
                'role' => $record['role'],
                'student_id' => $record['student_id'] ?? null,
                'employee_id' => $record['employee_id'] ?? null,
                'department' => $record['department'] ?? null,
                'grade_level' => $record['grade_level'] ?? null,
                'section' => $record['section'] ?? null,
                'position' => $record['position'] ?? null,
                'phone' => $record['phone'] ?? null,
                'salary_deduction_limit' => $record['salary_deduction_limit'] ?? 0,
                'is_active' => true,
            ]);

            $created++;
        }

        fclose($handle);

        $message = "{$created} users imported successfully.";
        if (!empty($errors)) {
            $message .= " " . count($errors) . " rows had errors.";
        }

        return back()->with('success', $message)
            ->with('import_errors', $errors);
    }

    public function updateDeductionLimit(Request $request, User $user)
    {
        $request->validate([
            'salary_deduction_limit' => 'required|numeric|min:0',
        ]);

        if (!$user->isFaculty()) {
            return back()->withErrors(['user' => 'Salary deduction limits can only be set for faculty members.']);
        }

        $user->update(['salary_deduction_limit' => $request->salary_deduction_limit]);

        return back()->with('success', "Deduction limit updated to ₱" . number_format($request->salary_deduction_limit, 2));
    }
}
