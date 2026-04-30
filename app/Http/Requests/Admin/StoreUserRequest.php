<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', Password::defaults()],
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
    }

    public function messages(): array
    {
        return [
            'role.in' => 'The selected role is invalid.',
        ];
    }
}
