import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type LibraryCategory } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FolderTree, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
    categories: LibraryCategory[];
}

const breadcrumbs = [
    { title: 'Library', href: '/library' },
    { title: 'Categories', href: '/library/categories' },
];

export default function LibraryCategoriesIndex({ categories }: Props) {
    const { props } = usePage();
    const csrfToken = (props as any).csrf_token as string;

    const [isOpen, setIsOpen] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        description: '',
        parent_id: '0',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/library/categories', {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(`/library/categories/${id}`, {
                headers: { 'X-CSRF-TOKEN': csrfToken },
                onSuccess: () => {
                    router.reload();
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Categories</h1>
                        <p className="text-muted-foreground">Organize books with categories</p>
                    </div>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => {
                                    reset();
                                    setIsOpen(true);
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Category</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Name</Label>
                                    <Input value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Description</Label>
                                    <Input value={data.description} onChange={(e) => setData('description', e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Parent Category</Label>
                                    <select
                                        value={String(data.parent_id)}
                                        onChange={(e) => setData('parent_id', e.target.value)}
                                        className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2"
                                    >
                                        <option value="">No Parent</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Create
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                        <Card key={category.id}>
                            <CardContent className="pt-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-muted flex h-10 w-10 items-center justify-center rounded">
                                            <FolderTree className="text-muted-foreground h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{category.name}</h3>
                                            {category.description && <p className="text-muted-foreground text-sm">{category.description}</p>}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(category.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                {category.children && category.children.length > 0 && (
                                    <div className="mt-3 ml-5 border-l-2 pl-13">
                                        {category.children.map((child) => (
                                            <div key={child.id} className="text-muted-foreground py-1 text-sm">
                                                {child.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {categories.length === 0 && (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <FolderTree className="text-muted-foreground mx-auto mb-2 h-12 w-12" />
                            <p className="text-muted-foreground">No categories yet</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
