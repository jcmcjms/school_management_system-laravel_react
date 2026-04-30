<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'role' => $this->role,
            'role_label' => $this->role_label,
            'student_id' => $this->student_id,
            'grade_level' => $this->grade_level,
            'section' => $this->section,
            'linked_student_id' => $this->linked_student_id,
            'employee_id' => $this->employee_id,
            'department' => $this->department,
            'salary_deduction_limit' => $this->salary_deduction_limit,
            'salary_deduction_current' => $this->salary_deduction_current,
            'position' => $this->position,
            'phone' => $this->phone,
            'is_active' => $this->is_active,
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    protected function getRoleLabel(): string
    {
        return match ($this->role) {
            'admin' => 'Admin',
            'manager' => 'Manager',
            'staff' => 'Staff',
            'librarian' => 'Librarian',
            'student' => 'Student',
            'parent' => 'Parent',
            'faculty' => 'Faculty',
            default => $this->role,
        };
    }
}
