import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ChatConversation, type ChatMessage, type ChatUser, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, MessageCircle, Plus, Search, Send } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

function formatLocalTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

interface ChatPageProps {
    conversations: ChatConversation[];
    activeConversation: { id: number; other_user: ChatUser } | null;
    messages: ChatMessage[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Chat', href: '/chat' }];

const roleBadge: Record<string, string> = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    staff: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    student: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    parent: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    faculty: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
};

export default function ChatIndex() {
    const { auth } = usePage<SharedData>().props;
    const { conversations, activeConversation, messages: initialMessages } = usePage<ChatPageProps>().props;
    const getInitials = useInitials();
    const currentUserId = auth.user.id;

    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages || []);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewChat, setShowNewChat] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
    const [searching, setSearching] = useState(false);
    const [mobileShowChat, setMobileShowChat] = useState(!!activeConversation);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastPollTime = useRef<string | null>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Update messages when navigating between conversations
    useEffect(() => {
        setMessages(initialMessages || []);
        if (initialMessages?.length) {
            lastPollTime.current = initialMessages[initialMessages.length - 1].created_at;
        } else {
            lastPollTime.current = null;
        }
    }, [activeConversation?.id]);

    // Poll for new messages every 2s (near real-time)
    useEffect(() => {
        if (!activeConversation) return;
        const poll = async () => {
            try {
                const params = lastPollTime.current ? `?since=${encodeURIComponent(lastPollTime.current)}` : '';
                const res = await fetch(`/api/chat/${activeConversation.id}/poll${params}`, {
                    credentials: 'same-origin',
                    headers: { Accept: 'application/json' },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.messages?.length > 0) {
                        setMessages((prev) => {
                            const existingIds = new Set(prev.map((m) => m.id));
                            const newMsgs = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id));
                            if (newMsgs.length === 0) return prev;
                            const updated = [...prev, ...newMsgs];
                            lastPollTime.current = updated[updated.length - 1].created_at;
                            return updated;
                        });
                    }
                }
            } catch {
                /* silent */
            }
        };
        poll(); // Immediate first poll
        const id = setInterval(poll, 2000);
        return () => clearInterval(id);
    }, [activeConversation?.id]);

    const handleSend = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!newMessage.trim() || !activeConversation || sending) return;

            setSending(true);
            try {
                const res = await fetch(`/chat/${activeConversation.id}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': getCsrfToken(), Accept: 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({ body: newMessage.trim() }),
                });
                if (res.ok) {
                    const msg: ChatMessage = await res.json();
                    setMessages((prev) => [...prev, msg]);
                    lastPollTime.current = msg.created_at;
                    setNewMessage('');
                }
            } catch {
                /* silent */
            }
            setSending(false);
        },
        [newMessage, activeConversation, sending],
    );

    // User search for new conversation
    useEffect(() => {
        if (!userSearchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const timeout = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`/api/chat/users?q=${encodeURIComponent(userSearchQuery)}`, {
                    credentials: 'same-origin',
                    headers: { Accept: 'application/json' },
                });
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data.users || []);
                }
            } catch {
                /* silent */
            }
            setSearching(false);
        }, 300);
        return () => clearTimeout(timeout);
    }, [userSearchQuery]);

    const filteredConversations = conversations.filter((c) => c.other_user.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chat" />
            <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
                {/* Left: Conversation List */}
                <div className={`flex w-full flex-col border-r md:w-80 lg:w-96 ${mobileShowChat && activeConversation ? 'hidden md:flex' : 'flex'}`}>
                    <div className="flex items-center justify-between border-b p-4">
                        <h2 className="text-lg font-semibold">Messages</h2>
                        <button
                            onClick={() => {
                                setShowNewChat(true);
                                setUserSearchQuery('');
                                setSearchResults([]);
                            }}
                            className="text-primary hover:bg-accent rounded-md p-2"
                            title="New chat"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="border-b px-4 py-2">
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-background focus:ring-primary w-full rounded-md border py-2 pr-3 pl-9 text-sm focus:ring-2 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Conversation list */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <MessageCircle className="text-muted-foreground/40 mx-auto h-10 w-10" />
                                <p className="text-muted-foreground mt-2 text-sm">No conversations yet</p>
                                <button onClick={() => setShowNewChat(true)} className="text-primary mt-2 text-sm font-medium hover:underline">
                                    Start a new chat
                                </button>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => {
                                        router.visit(`/chat/${conv.id}`);
                                        setMobileShowChat(true);
                                    }}
                                    className={`hover:bg-accent flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors ${
                                        activeConversation?.id === conv.id ? 'bg-accent' : ''
                                    }`}
                                >
                                    <div className="relative">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={conv.other_user.avatar || undefined} />
                                            <AvatarFallback className="bg-primary/10 text-sm font-medium">
                                                {getInitials(conv.other_user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        {conv.unread_count > 0 && (
                                            <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
                                                {conv.unread_count > 9 ? '9+' : conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className={`truncate text-sm ${conv.unread_count > 0 ? 'font-bold' : 'font-medium'}`}>
                                                {conv.other_user.name}
                                            </p>
                                            {conv.last_message && (
                                                <span className="text-muted-foreground shrink-0 text-xs">{conv.last_message.time_ago}</span>
                                            )}
                                        </div>
                                        {conv.last_message ? (
                                            <p
                                                className={`truncate text-xs ${conv.unread_count > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}
                                            >
                                                {conv.last_message.sender_id === currentUserId ? 'You: ' : ''}
                                                {conv.last_message.body}
                                            </p>
                                        ) : (
                                            <p className="text-muted-foreground text-xs italic">No messages yet</p>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Chat Area */}
                <div className={`flex flex-1 flex-col ${!mobileShowChat && activeConversation === null ? 'hidden md:flex' : 'flex'}`}>
                    {activeConversation ? (
                        <>
                            {/* Chat header */}
                            <div className="flex items-center gap-3 border-b px-4 py-3">
                                <button
                                    onClick={() => {
                                        setMobileShowChat(false);
                                        router.visit('/chat');
                                    }}
                                    className="hover:bg-accent rounded-md p-1 md:hidden"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={activeConversation.other_user.avatar || undefined} />
                                    <AvatarFallback className="bg-primary/10 text-sm">
                                        {getInitials(activeConversation.other_user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-semibold">{activeConversation.other_user.name}</p>
                                    <span
                                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${roleBadge[activeConversation.other_user.role] || 'bg-gray-100'}`}
                                    >
                                        {activeConversation.other_user.role}
                                    </span>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {messages.length === 0 ? (
                                    <div className="flex h-full items-center justify-center">
                                        <div className="text-center">
                                            <MessageCircle className="text-muted-foreground/30 mx-auto h-12 w-12" />
                                            <p className="text-muted-foreground mt-2 text-sm">Send a message to start the conversation</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {messages.map((msg) => {
                                            const isMine = msg.sender_id === currentUserId;
                                            return (
                                                <div key={msg.id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : ''}`}>
                                                    {!isMine && (
                                                        <Avatar className="h-7 w-7 shrink-0">
                                                            <AvatarImage src={msg.sender_avatar || undefined} />
                                                            <AvatarFallback className="bg-primary/10 text-[10px]">
                                                                {getInitials(msg.sender_name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <div
                                                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                                            isMine ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-accent rounded-bl-md'
                                                        }`}
                                                    >
                                                        <p className="text-sm break-words whitespace-pre-wrap">{msg.body}</p>
                                                        <p
                                                            className={`mt-1 text-[10px] ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                                                        >
                                                            {formatLocalTime(msg.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} className="border-t p-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        maxLength={2000}
                                        className="bg-background focus:ring-primary flex-1 rounded-full border px-4 py-2.5 text-sm focus:ring-2 focus:outline-none"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || sending}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-10 w-10 items-center justify-center rounded-full transition-colors disabled:opacity-50"
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                                <MessageCircle className="text-muted-foreground/20 mx-auto h-16 w-16" />
                                <h3 className="text-muted-foreground mt-4 text-lg font-semibold">Select a conversation</h3>
                                <p className="text-muted-foreground mt-1 text-sm">Choose a conversation or start a new one</p>
                                <button
                                    onClick={() => setShowNewChat(true)}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium"
                                >
                                    <Plus className="h-4 w-4" /> New Chat
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* New Chat Modal */}
                {showNewChat && (
                    <>
                        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowNewChat(false)} />
                        <div className="bg-card fixed inset-x-4 top-[10%] z-50 mx-auto max-w-md rounded-xl border shadow-xl">
                            <div className="flex items-center justify-between border-b p-4">
                                <h3 className="font-semibold">New Conversation</h3>
                                <button onClick={() => setShowNewChat(false)} className="text-muted-foreground hover:text-foreground">
                                    &times;
                                </button>
                            </div>
                            <div className="p-4">
                                <div className="relative">
                                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={userSearchQuery}
                                        onChange={(e) => setUserSearchQuery(e.target.value)}
                                        autoFocus
                                        className="bg-background focus:ring-primary w-full rounded-md border py-2 pr-3 pl-9 text-sm focus:ring-2 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="max-h-64 overflow-y-auto px-2 pb-4">
                                {searching && <p className="text-muted-foreground px-4 py-2 text-center text-sm">Searching...</p>}
                                {!searching && userSearchQuery && searchResults.length === 0 && (
                                    <p className="text-muted-foreground px-4 py-2 text-center text-sm">No users found</p>
                                )}
                                {searchResults.map((user) => (
                                    <button
                                        key={user.id}
                                        onClick={() => {
                                            setShowNewChat(false);
                                            router.post(`/chat/start/${user.id}`);
                                        }}
                                        className="hover:bg-accent flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left"
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={user.avatar || undefined} />
                                            <AvatarFallback className="bg-primary/10 text-sm">{getInitials(user.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{user.name}</p>
                                            <p className="text-muted-foreground truncate text-xs">{user.email}</p>
                                        </div>
                                        <span
                                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${roleBadge[user.role] || 'bg-gray-100'}`}
                                        >
                                            {user.role}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
