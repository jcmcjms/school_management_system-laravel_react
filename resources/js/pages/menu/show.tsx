import { Head, usePage } from '@inertiajs/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

interface MenuShowPageProps {
    item: MenuItem;
}

const formatPrice = (price: number | string): string => {
    return Number(price).toFixed(2);
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Menu', href: '/menu' }];

export default function MenuShow() {
    const { item } = usePage<MenuShowPageProps>().props;

    const breadcrumbsWithItem: BreadcrumbItem[] = [...breadcrumbs, { title: item.name, href: `/menu/${item.slug}` }];

    return (
        <AppLayout breadcrumbs={breadcrumbsWithItem}>
            <Head title={item.name} />
            <div className="flex flex-1 flex-col gap-8 p-4">
                <div className="mx-auto w-full max-w-3xl">
                    {item.image_url && (
                        <div className="mb-6 aspect-video w-full overflow-hidden rounded-xl">
                            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                    )}

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">{item.name}</h1>
                            <p className="text-muted-foreground mt-1">{item.category.name}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-bold">₱{formatPrice(item.price)}</span>
                            {item.availability_status === 'limited' && (
                                <Badge variant="secondary" className="ml-2">
                                    Limited
                                </Badge>
                            )}
                        </div>
                    </div>

                    {item.description && <p className="text-muted-foreground mt-6 text-lg">{item.description}</p>}

                    {item.nutritional_info && Object.keys(item.nutritional_info).length > 0 && (
                        <div className="mt-6">
                            <h2 className="mb-3 text-xl font-semibold">Nutritional Information</h2>
                            <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 sm:grid-cols-4">
                                {Object.entries(item.nutritional_info).map(([key, value]) => (
                                    <div key={key} className="text-center">
                                        <div className="text-2xl font-bold">{value}</div>
                                        <div className="text-muted-foreground text-sm">{key}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {item.allergens && item.allergens.length > 0 && (
                        <div className="mt-6">
                            <h2 className="mb-3 text-xl font-semibold">Allergens</h2>
                            <div className="flex flex-wrap gap-2">
                                {item.allergens.map((allergen) => (
                                    <Badge key={allergen} variant="destructive">
                                        {allergen}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {item.ingredients && item.ingredients.length > 0 && (
                        <div className="mt-6">
                            <h2 className="mb-3 text-xl font-semibold">Ingredients</h2>
                            <ul className="grid gap-2 rounded-lg border p-4 sm:grid-cols-2">
                                {item.ingredients.map((ingredient) => (
                                    <li key={ingredient.id} className="flex justify-between">
                                        <span className="text-muted-foreground">{ingredient.ingredient_name}</span>
                                        <span className="font-medium">
                                            {ingredient.quantity_required} {ingredient.unit}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="mt-8">
                        <Button className="w-full" size="lg">
                            Add to Order
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
