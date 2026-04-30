import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type LibraryBook, type LibraryCategory, type PaginatedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { BookOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
    books: PaginatedData<LibraryBook>;
    categories: LibraryCategory[];
    filters?: {
        search?: string;
        category?: string;
        status?: string;
    };
}

const breadcrumbs = [
    { title: 'Library', href: '/library' },
    { title: 'Books', href: '/library/books' },
];

export default function LibraryBooksIndex({ books, categories, filters = {} }: Props) {
    const { props } = usePage();
    const csrfToken = (props as any).csrf_token as string;

    const [isOpen, setIsOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<LibraryBook | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '0');
    const [status, setStatus] = useState(filters.status || '0');

    const { data, setData, put, post, processing, reset } = useForm({
        isbn: '',
        title: '',
        author: '',
        publisher: '',
        published_year: '',
        category_id: '0',
        description: '',
        total_copies: 1,
        location: '',
        status: 'available',
    });

    const handleOpenNew = () => {
        setEditingBook(null);
        reset();
        setIsOpen(true);
    };

    const handleEdit = (book: LibraryBook) => {
        setEditingBook(book);
        setData({
            isbn: book.isbn,
            title: book.title,
            author: book.author,
            publisher: book.publisher || '',
            published_year: book.published_year || '',
            category_id: book.category_id || '',
            description: book.description || '',
            total_copies: book.total_copies,
            location: book.location || '',
            status: book.status,
        });
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingBook) {
            put(`/library/books/${editingBook.id}`, {
                onSuccess: () => {
                    setIsOpen(false);
                    setEditingBook(null);
                    reset();
                },
            });
        } else {
            post('/library/books', {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (bookId: number) => {
        if (confirm('Are you sure you want to delete this book?')) {
            router.delete(`/library/books/${bookId}`, {
                headers: { 'X-CSRF-TOKEN': csrfToken },
                onSuccess: () => {
                    router.reload();
                },
            });
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/library/books',
            {
                search: search || undefined,
                category: category && category !== '0' ? category : undefined,
                status: status && status !== '0' ? status : undefined,
            },
            { preserveState: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setCategory('0');
        setStatus('0');
        router.get('/library/books', {}, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Library Books" />
            <div className="space-y-4 p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold sm:text-3xl">Library Books</h1>
                        <p className="text-muted-foreground text-sm">Manage the book collection</p>
                    </div>
                    <Dialog
                        open={isOpen}
                        onOpenChange={(open) => {
                            setIsOpen(open);
                            if (!open) {
                                setEditingBook(null);
                                reset();
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button onClick={handleOpenNew} className="inline-flex items-center">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Book
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>ISBN</Label>
                                        <Input value={data.isbn} onChange={(e) => setData('isbn', e.target.value)} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Title</Label>
                                        <Input value={data.title} onChange={(e) => setData('title', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Author</Label>
                                    <Input value={data.author} onChange={(e) => setData('author', e.target.value)} required />
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Publisher</Label>
                                        <Input value={data.publisher} onChange={(e) => setData('publisher', e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Year</Label>
                                        <Input
                                            type="number"
                                            value={data.published_year}
                                            onChange={(e) => setData('published_year', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Category</Label>
                                    <Select value={String(data.category_id)} onValueChange={(val) => setData('category_id', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Description</Label>
                                    <Input value={data.description} onChange={(e) => setData('description', e.target.value)} />
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Total Copies</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={data.total_copies}
                                            onChange={(e) => setData('total_copies', parseInt(e.target.value))}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Location</Label>
                                        <Input value={data.location} onChange={(e) => setData('location', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status</Label>
                                    <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="unavailable">Unavailable</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsOpen(false);
                                            setEditingBook(null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {editingBook ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Search & Filter</CardTitle>
                        <form onSubmit={handleSearch} className="mt-2 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:gap-4">
                            <div className="relative flex-1">
                                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <Input placeholder="Search..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="w-full sm:w-[160px]">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">All Categories</SelectItem>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full sm:w-[140px]">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">All Status</SelectItem>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="unavailable">Unavailable</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit" className="sm:px-4">
                                Search
                            </Button>
                            {(search || category || status) && (
                                <Button type="button" variant="outline" onClick={clearFilters}>
                                    Clear
                                </Button>
                            )}
                        </form>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b">
                                    <tr className="text-left">
                                        <th className="p-3 text-xs font-medium sm:p-4 sm:text-sm">ISBN</th>
                                        <th className="p-3 text-xs font-medium sm:p-4 sm:text-sm">Title</th>
                                        <th className="hidden p-3 text-xs font-medium sm:p-4 sm:text-sm md:table-cell">Author</th>
                                        <th className="hidden p-3 text-xs font-medium sm:p-4 sm:text-sm lg:table-cell">Category</th>
                                        <th className="p-3 text-xs font-medium sm:p-4 sm:text-sm">Copies</th>
                                        <th className="hidden p-3 text-xs font-medium sm:table-cell sm:p-4 sm:text-sm">Status</th>
                                        <th className="p-3 text-xs font-medium sm:p-4 sm:text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {books.data.map((book) => (
                                        <tr key={book.id} className="border-b">
                                            <td className="p-3 text-xs sm:p-4 sm:text-sm">{book.isbn}</td>
                                            <td className="p-3 text-xs font-medium sm:p-4 sm:text-sm">{book.title}</td>
                                            <td className="hidden p-3 text-xs sm:p-4 sm:text-sm md:table-cell">{book.author}</td>
                                            <td className="hidden p-3 text-xs sm:p-4 sm:text-sm lg:table-cell">{book.category?.name || '-'}</td>
                                            <td className="p-3 text-xs sm:p-4 sm:text-sm">
                                                {book.available_copies} / {book.total_copies}
                                            </td>
                                            <td className="hidden p-3 sm:table-cell sm:p-4">
                                                <Badge
                                                    variant={
                                                        book.status === 'available'
                                                            ? 'default'
                                                            : book.status === 'unavailable'
                                                              ? 'secondary'
                                                              : 'outline'
                                                    }
                                                >
                                                    {book.status}
                                                </Badge>
                                            </td>
                                            <td className="p-3 sm:p-4">
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="outline" onClick={() => handleEdit(book)}>
                                                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-destructive"
                                                        onClick={() => handleDelete(book.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {books.data.length === 0 && (
                            <div className="py-8 text-center">
                                <BookOpen className="text-muted-foreground mx-auto mb-2 h-10 sm:h-12" />
                                <p className="text-muted-foreground">No books found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {books.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: books.last_page }, (_, i) => (
                            <Button
                                key={i}
                                variant={books.current_page === i + 1 ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get(`/library/books?page=${i + 1}`, {}, { preserveState: true })}
                            >
                                {i + 1}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
