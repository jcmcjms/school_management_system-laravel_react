<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class CustomPasswordResetController extends Controller
{
    public function show(Request $request): \Inertia\Response
    {
        return \Inertia\Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]);
    }

    public function sendResetLink(Request $request): RedirectResponse
    {
        $request->validate([
            'id_number' => 'required|string',
        ]);

        $idNumber = $request->input('id_number');

        $user = User::where('student_id', $idNumber)
            ->orWhere('employee_id', $idNumber)
            ->first();

        if (!$user) {
            return back()->withErrors([
                'id_number' => 'No user found with this ID number.',
            ]);
        }

        $token = Password::createToken($user);

        return back()->with('status', 'Demo mode: In production, an email would be sent to ' . $user->email . ' with token: ' . substr($token, 0, 8) . '...');
    }

    public function showResetForm(Request $request, string $token): \Inertia\Response
    {
        return \Inertia\Inertia::render('auth/reset-password', [
            'token' => $token,
            'email' => $request->email,
        ]);
    }

    public function reset(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required',
            'id_number' => 'required|string',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $idNumber = $request->input('id_number');

        $user = User::where('student_id', $idNumber)
            ->orWhere('employee_id', $idNumber)
            ->first();

        if (!$user) {
            return back()->withErrors([
                'id_number' => 'Invalid ID number.',
            ]);
        }

        $status = Password::reset(
            [
                'email' => $user->email,
                'password' => $request->password,
                'password_confirmation' => $request->password_confirmation,
                'token' => $request->token,
            ],
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            return to_route('login')->with('status', 'Password reset successfully!');
        }

        throw ValidationException::withMessages([
            'id_number' => [__($status)],
        ]);
    }
}