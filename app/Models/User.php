<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Traits\HasPermissions;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, HasPermissions, Notifiable;

    public const ROLES = [
        'admin' => 'Admin',
        'manager' => 'Manager',
        'staff' => 'Staff',
        'student' => 'Student',
        'parent' => 'Parent',
        'faculty' => 'Faculty',
    ];

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'student_id',
        'parent_id',
        'grade_level',
        'section',
        'linked_student_id',
        'employee_id',
        'department',
        'salary_deduction_limit',
        'salary_deduction_current',
        'position',
        'phone',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'salary_deduction_limit' => 'decimal:2',
            'salary_deduction_current' => 'decimal:2',
        ];
    }

    public function isRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isManager(): bool
    {
        return $this->role === 'manager';
    }

    public function isStaff(): bool
    {
        return $this->role === 'staff';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function isParent(): bool
    {
        return $this->role === 'parent';
    }

    public function isFaculty(): bool
    {
        return $this->role === 'faculty';
    }

    public function canAccessAdmin(): bool
    {
        return in_array($this->role, ['admin', 'manager']);
    }

    public function linkedStudent(): ?self
    {
        return $this->belongsTo(self::class, 'linked_student_id');
    }

    public function parents(): ?self
    {
        return $this->hasMany(self::class, 'linked_student_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'user_id');
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'user_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'user_id');
    }

    public function salaryDeductions()
    {
        return $this->hasMany(SalaryDeduction::class, 'user_id');
    }

    public function inventoryTransactions()
    {
        return $this->hasMany(InventoryTransaction::class, 'user_id');
    }

    public function getRemainingDeductionLimit(): float
    {
        return (float) ($this->salary_deduction_limit - $this->salary_deduction_current);
    }

    public function canDeductSalary(float $amount): bool
    {
        return $this->isFaculty() && $this->getRemainingDeductionLimit() >= $amount;
    }
}
