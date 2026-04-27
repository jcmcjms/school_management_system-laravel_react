import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface MenuItem {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    image_url: string | null;
    available_quantity: number;
    availability_status: string;
    allergens: string[] | null;
    nutritional_info: Record<string, string> | null;
    category: {
        id: number;
        name: string;
        slug: string;
    };
    ingredients: Array<{
        id: number;
        ingredient_name: string;
        quantity_required: number;
        unit: string;
    }>;
}

interface MenuCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    sort_order: number;
    is_active: boolean;
    menu_items: MenuItem[];
}

interface MenuPageProps {
    categories: MenuCategory[];
}

const formatPrice = (price: number | string): string => {
    return Number(price).toFixed(2);
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Menu',
        href: '/menu',
    },
];

export default function MenuIndex() {
    const { categories } = usePage<MenuPageProps>().props;
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleItemClick = (item: MenuItem) => {
        setSelectedItem(item);
        setIsDialogOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu" />
            <div className="flex flex-1 flex-col gap-8 p-4">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Our Menu</h1>
                    <p className="text-muted-foreground mt-2">Browse our selection of delicious meals</p>
                </div>

                {categories.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No menu items available at the moment.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-12">
                        {categories.map((category) => (
                            <section key={category.id} className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-semibold">{category.name}</h2>
                                    {category.description && (
                                        <span className="text-muted-foreground text-sm">
                                            — {category.description}
                                        </span>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {category.menu_items.map((item) => (
                                        <Card
                                            key={item.id}
                                            className="cursor-pointer transition-all hover:shadow-md"
                                            onClick={() => handleItemClick(item)}
                                        >
                                            {item.image_url && (
                                                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <CardTitle className="text-lg">{item.name}</CardTitle>
                                                    {item.availability_status === 'limited' && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Limited
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-muted-foreground line-clamp-2 text-sm">
                                                    {item.description || 'No description available'}
                                                </p>
                                                {item.allergens && item.allergens.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {item.allergens.map((allergen) => (
                                                            <Badge key={allergen} variant="outline" className="text-xs">
                                                                {allergen}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                            <CardFooter className="flex justify-between">
                                                <span className="text-lg font-semibold">
                                                    ₱{formatPrice(item.price)}
                                                </span>
                                                {item.available_quantity > 0 && item.available_quantity <= 5 && (
                                                    <span className="text-muted-foreground text-xs">
                                                        Only {item.available_quantity} left
                                                    </span>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>

                                {category.menu_items.length === 0 && (
                                    <p className="text-muted-foreground py-4">
                                        No items available in this category
                                    </p>
                                )}
                            </section>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">{selectedItem?.name}</DialogTitle>
                        <DialogDescription className="text-base">
                            {selectedItem?.category.name}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedItem?.image_url && (
                        <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg">
                            <img
                                src={selectedItem.image_url}
                                alt={selectedItem.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}

                    {selectedItem?.description && (
                        <p className="mb-4 text-muted-foreground">{selectedItem.description}</p>
                    )}

                    <div className="mb-4 flex items-center justify-between">
                        <span className="text-2xl font-bold">₱{formatPrice(selectedItem?.price ?? 0)}</span>
                        {selectedItem?.availability_status === 'limited' && (
                            <Badge variant="secondary">Limited Availability</Badge>
                        )}
                    </div>

                    {selectedItem?.nutritional_info && Object.keys(selectedItem.nutritional_info).length > 0 && (
                        <div className="mb-4">
                            <h4 className="mb-2 font-semibold">Nutritional Information</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {Object.entries(selectedItem.nutritional_info).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                        <span className="text-muted-foreground">{key}</span>
                                        <span className="font-medium">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedItem?.allergens && selectedItem.allergens.length > 0 && (
                        <div className="mb-4">
                            <h4 className="mb-2 font-semibold">Allergens</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedItem.allergens.map((allergen) => (
                                    <Badge key={allergen} variant="destructive">
                                        {allergen}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedItem?.ingredients && selectedItem.ingredients.length > 0 && (
                        <div className="mb-4">
                            <h4 className="mb-2 font-semibold">Ingredients</h4>
                            <ul className="list-disc pl-4 text-sm text-muted-foreground">
                                {selectedItem.ingredients.map((ingredient) => (
                                    <li key={ingredient.id}>
                                        {ingredient.ingredient_name} - {ingredient.quantity_required}{' '}
                                        {ingredient.unit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="mt-4 flex gap-2">
                        <Button className="flex-1">Add to Order</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}