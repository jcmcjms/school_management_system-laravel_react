<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserService extends BaseService
{
    protected string $modelClass = User::class;

    public function getAll(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = User::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('student_id', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        return $query->orderBy('name')->paginate($perPage);
    }

    public function create(array $data): User
    {
        $validated = $this->validateUserData($data);

        $validated['password'] = Hash::make($validated['password']);
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['salary_deduction_limit'] = $validated['salary_deduction_limit'] ?? 0;
        $validated['salary_deduction_current'] = 0;

        return User::create($validated);
    }

    public function update(User $user, array $data): User
    {
        $validated = $this->validateUserData($data, $user);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return $user;
    }

    public function delete(User $user): bool
    {
        if ($user->id === auth()->id()) {
            return false;
        }

        return $user->delete();
    }

    public function importFromCsv(string $filePath): array
    {
        $handle = fopen($filePath, 'r');
        $headers = array_map('strtolower', array_map('trim', fgetcsv($handle)));

        $requiredHeaders = ['name', 'email', 'role'];
        foreach ($requiredHeaders as $req) {
            if (!in_array($req, $headers)) {
                fclose($handle);
                throw new \InvalidArgumentException("Missing required column: {$req}");
            }
        }

        $created = 0;
        $errors = [];
        $row = 1;

        while (($data = fgetcsv($handle)) !== false) {
            $row++;
            $record = array_combine($headers, $data);

            if (!$this->isValidRecord($record, $errors, $row)) {
                continue;
            }

            $this->createFromRecord($record);
            $created++;
        }

        fclose($handle);

        return [
            'created' => $created,
            'errors' => $errors,
        ];
    }

    public function updateDeductionLimit(User $user, float $limit): User
    {
        if (!$user->isFaculty()) {
            throw new \InvalidArgumentException('Salary deduction limits can only be set for faculty members.');
        }

        $user->update(['salary_deduction_limit' => $limit]);

        return $user;
    }

    protected function validateUserData(array $data, ?User $user = null): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email' . ($user ? ",{$user->id}" : ''),
            'password' => $user ? ['nullable', Password::defaults()] : ['required', Password::defaults()],
            'role' => 'required|in:' . implode(',', array_keys(User::ROLES)),
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
        ];

        return validator($data, $rules)->validate();
    }

    protected function isValidRecord(array $record, array &$errors, int $row): bool
    {
        if (empty($record['name']) || empty($record['email']) || empty($record['role'])) {
            $errors[] = "Row {$row}: Missing required fields.";
            return false;
        }

        if (!in_array($record['role'], array_keys(User::ROLES))) {
            $errors[] = "Row {$row}: Invalid role '{$record['role']}'.";
            return false;
        }

        if (User::where('email', $record['email'])->exists()) {
            $errors[] = "Row {$row}: Email '{$record['email']}' already exists.";
            return false;
        }

        return true;
    }

    protected function createFromRecord(array $record): User
    {
        return User::create([
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
    }
}
