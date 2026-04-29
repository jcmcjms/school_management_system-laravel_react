<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    /**
     * Chat page — shows conversation list and optionally an active conversation.
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $conversations = $this->getConversationList($userId);

        return Inertia::render('chat/index', [
            'conversations' => $conversations,
            'activeConversation' => null,
            'messages' => [],
        ]);
    }

    /**
     * Show a specific conversation.
     */
    public function show(Request $request, Conversation $conversation)
    {
        $userId = $request->user()->id;

        if (!$conversation->hasParticipant($userId)) {
            abort(403);
        }

        // Mark messages as read
        $conversation->messages()
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $conversations = $this->getConversationList($userId);

        $messages = $conversation->messages()
            ->with('sender:id,name,avatar_path')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'body' => $m->body,
                'sender_id' => $m->sender_id,
                'sender_name' => $m->sender->name,
                'sender_avatar' => $m->sender->avatar,
                'read_at' => $m->read_at,
                'created_at' => $m->created_at->toISOString(),
                'time' => $m->created_at->format('g:i A'),
            ]);

        $otherUser = $conversation->getOtherUser($userId);

        return Inertia::render('chat/index', [
            'conversations' => $conversations,
            'activeConversation' => [
                'id' => $conversation->id,
                'other_user' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'avatar' => $otherUser->avatar,
                    'role' => $otherUser->role,
                ],
            ],
            'messages' => $messages,
        ]);
    }

    /**
     * Start or find a conversation with another user.
     */
    public function startConversation(Request $request, User $user)
    {
        $currentUser = $request->user();

        if ($currentUser->id === $user->id) {
            return back()->withErrors(['chat' => 'You cannot start a chat with yourself.']);
        }

        $conversation = Conversation::findOrCreateBetween($currentUser->id, $user->id);

        return redirect()->route('chat.show', $conversation->id);
    }

    /**
     * Send a message in a conversation.
     */
    public function sendMessage(Request $request, Conversation $conversation)
    {
        $userId = $request->user()->id;

        if (!$conversation->hasParticipant($userId)) {
            abort(403);
        }

        $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $userId,
            'body' => $request->body,
        ]);

        $conversation->update(['last_message_at' => now()]);

        $message->load('sender:id,name,avatar_path');

        return response()->json([
            'id' => $message->id,
            'body' => $message->body,
            'sender_id' => $message->sender_id,
            'sender_name' => $message->sender->name,
            'sender_avatar' => $message->sender->avatar,
            'read_at' => null,
            'created_at' => $message->created_at->toISOString(),
            'time' => $message->created_at->format('g:i A'),
        ]);
    }

    /**
     * Poll for new messages in a conversation (JSON).
     */
    public function pollMessages(Request $request, Conversation $conversation)
    {
        $userId = $request->user()->id;

        if (!$conversation->hasParticipant($userId)) {
            abort(403);
        }

        $since = $request->query('since');

        $query = $conversation->messages()->with('sender:id,name,avatar_path');

        if ($since) {
            $query->where('created_at', '>', $since);
        }

        $messages = $query->orderBy('created_at', 'asc')
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'body' => $m->body,
                'sender_id' => $m->sender_id,
                'sender_name' => $m->sender->name,
                'sender_avatar' => $m->sender->avatar,
                'read_at' => $m->read_at,
                'created_at' => $m->created_at->toISOString(),
                'time' => $m->created_at->format('g:i A'),
            ]);

        // Mark new messages from the other user as read
        if ($messages->isNotEmpty()) {
            $conversation->messages()
                ->where('sender_id', '!=', $userId)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);
        }

        return response()->json(['messages' => $messages]);
    }

    /**
     * Poll for conversation list updates (JSON).
     */
    public function pollConversations(Request $request)
    {
        $userId = $request->user()->id;

        return response()->json([
            'conversations' => $this->getConversationList($userId),
        ]);
    }

    /**
     * Mark all messages in a conversation as read.
     */
    public function markRead(Request $request, Conversation $conversation)
    {
        $userId = $request->user()->id;

        if (!$conversation->hasParticipant($userId)) {
            abort(403);
        }

        $conversation->messages()
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * Search users to start a new conversation.
     */
    public function searchUsers(Request $request)
    {
        $query = $request->query('q', '');
        $userId = $request->user()->id;

        $users = User::where('id', '!=', $userId)
            ->where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%");
            })
            ->select('id', 'name', 'email', 'role', 'avatar_path')
            ->limit(20)
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'avatar' => $u->avatar,
            ]);

        return response()->json(['users' => $users]);
    }

    /**
     * Build the conversation list for a user.
     */
    private function getConversationList(int $userId): array
    {
        $conversations = Conversation::forUser($userId)
            ->with(['userOne:id,name,avatar_path,role', 'userTwo:id,name,avatar_path,role', 'latestMessage'])
            ->orderByDesc('last_message_at')
            ->get();

        return $conversations->map(function ($conv) use ($userId) {
            $otherUser = $conv->getOtherUser($userId);
            $unread = $conv->unreadCountFor($userId);

            return [
                'id' => $conv->id,
                'other_user' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'avatar' => $otherUser->avatar,
                    'role' => $otherUser->role,
                ],
                'last_message' => $conv->latestMessage ? [
                    'body' => $conv->latestMessage->body,
                    'sender_id' => $conv->latestMessage->sender_id,
                    'created_at' => $conv->latestMessage->created_at->toISOString(),
                    'time_ago' => $conv->latestMessage->created_at->diffForHumans(),
                ] : null,
                'unread_count' => $unread,
            ];
        })->toArray();
    }
}
