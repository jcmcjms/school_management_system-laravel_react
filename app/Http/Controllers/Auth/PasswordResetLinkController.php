<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Show the password reset link request page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'id_number' => 'required|string',
        ]);

        $idNumber = $request->input('id_number');

        $user = \App\Models\User::where('student_id', $idNumber)
            ->orWhere('employee_id', $idNumber)
            ->first();

        if (!$user) {
            return back()->withErrors([
                'id_number' => __('No user found with this ID number.'),
            ]);
        }

        $status = Password::sendResetLink(
            ['email' => $user->email]
        );

        return $status === Password::RESET_LINK_SENT
            ? back()->with('status', __('A reset link will be sent to your email if the account exists.'))
            : back()->withErrors(['id_number' => __($status)]);
    }
}
