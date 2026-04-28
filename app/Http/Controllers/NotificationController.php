<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Full notifications page.
     */
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->paginate(20);

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
            'unreadCount' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    /**
     * Lightweight JSON endpoint for polling (no Inertia).
     */
    public function poll(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['unread_count' => 0, 'latest' => []]);
        }

        $unreadCount = $user->unreadNotifications()->count();

        $latest = $user->notifications()
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'data' => $n->data,
                'read_at' => $n->read_at,
                'created_at' => $n->created_at->toISOString(),
                'time_ago' => $n->created_at->diffForHumans(),
            ]);

        return response()->json([
            'unread_count' => $unreadCount,
            'latest' => $latest,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, string $id)
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);

        $notification->markAsRead();

        return back();
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return back()->with('success', 'All notifications marked as read.');
    }
}
