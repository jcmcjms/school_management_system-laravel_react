<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'id_number' => ['required', 'string'],
            'password' => ['required', 'string'],
            'role' => ['nullable', 'string', 'in:auto,student,parent'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $idNumber = $this->input('id_number');
        $password = $this->input('password');
        $role = $this->input('role', 'auto');

        $query = \App\Models\User::where(function ($q) use ($idNumber) {
            $q->where('student_id', $idNumber)
              ->orWhere('employee_id', $idNumber);
        });

        $users = $query->get();

        if ($users->isEmpty()) {
            RateLimiter::hit($this->throttleKey());
            throw ValidationException::withMessages([
                'id_number' => __('auth.failed'),
            ]);
        }

        if ($users->count() > 1 && $role === 'auto') {
            $hasMultiple = $users->filter(fn($u) => in_array($u->role, ['student', 'parent']))->count() > 1;
            if ($hasMultiple) {
                throw ValidationException::withMessages([
                    'id_number' => 'Multiple accounts found. Please select your role.',
                ]);
            }
        }

        if ($users->count() === 1) {
            $user = $users->first();
        } else {
            $filtered = $users->filter(function ($user) use ($role) {
                if ($role === 'student') {
                    return $user->role === 'student';
                } elseif ($role === 'parent') {
                    return $user->role === 'parent';
                }
                return true;
            });

            $user = $filtered->first() ?? $users->first();
        }

        if (!$user || !\Illuminate\Support\Facades\Hash::check($password, $user->password)) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'id_number' => __('auth.failed'),
            ]);
        }

        Auth::login($user, $this->boolean('remember'));

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'id_number' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('id_number')).'|'.$this->ip());
    }
}
