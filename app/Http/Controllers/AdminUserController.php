<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    public function __construct(
        protected UserService $userService
    ) {}

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'role']);
        $users = $this->userService->getAll($filters);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $filters,
            'roles' => User::ROLES,
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        try {
            $this->userService->create($request->validated());
            return back()->with('success', 'User created successfully.');
        } catch (\Throwable $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        try {
            $this->userService->update($user, $request->validated());
            return back()->with('success', 'User updated successfully.');
        } catch (\Throwable $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(User $user)
    {
        try {
            if (!$this->userService->delete($user)) {
                return back()->withErrors(['user' => 'You cannot delete your own account.']);
            }
            return back()->with('success', 'User deleted.');
        } catch (\Throwable $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function importCsv(Request $request)
    {
        $request->validate([
            'csv_file' => 'required|file|mimes:csv,txt|max:5120',
        ]);

        try {
            $result = $this->userService->importFromCsv($request->file('csv_file')->getRealPath());

            $message = "{$result['created']} users imported successfully.";
            if (!empty($result['errors'])) {
                $message .= " " . count($result['errors']) . " rows had errors.";
            }

            return back()->with('success', $message)
                ->with('import_errors', $result['errors']);
        } catch (\Throwable $e) {
            return back()->withErrors(['csv_file' => $e->getMessage()]);
        }
    }

    public function updateDeductionLimit(Request $request, User $user)
    {
        $request->validate([
            'salary_deduction_limit' => 'required|numeric|min:0',
        ]);

        try {
            $this->userService->updateDeductionLimit($user, $request->salary_deduction_limit);
            return back()->with('success', "Deduction limit updated to ₱" . number_format($request->salary_deduction_limit, 2));
        } catch (\Throwable $e) {
            return back()->withErrors(['user' => $e->getMessage()]);
        }
    }
}
