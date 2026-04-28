import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useCart } from '@/hooks/use-cart';

interface MenuItem {
    id: number; name: string; slug: string; description: string | null; price: number;
    image_url: string | null; available_quantity: number; availability_status: string;
    allergens: string[] | null; nutritional_info: Record<string, string> | null;
    category: { id: number; name: string; slug: string };
    ingredients: Array<{ id: number; ingredient_name: string; quantity_required: number; unit: string }>;
}

interface MenuCategory {
    id: number; name: string; slug: string; description: string | null;
    sort_order: number; is_active: boolean; menu_items: MenuItem[];
}

interface MenuPageProps { categories: MenuCategory[] }

const formatPrice = (p: number | string) => Number(p).toFixed(2);
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Menu', href: '/menu' }];

export default function MenuIndex() {
    const { categories } = usePage<MenuPageProps>().props;
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const { items: cartItems, addItem, updateQuantity, removeItem, total, itemCount } = useCart();

    const handleItemClick = (item: MenuItem) => { setSelectedItem(item); setIsDialogOpen(true); };
    const getCartQty = (id: number) => cartItems.find((i) => i.menuItem.id === id)?.quantity || 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu" />
            <div className="flex flex-1 flex-col gap-8 p-4">
                <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Our Menu</h1>
                        <p className="text-muted-foreground mt-2">Browse our selection of delicious meals</p>
                    </div>
                    {itemCount > 0 && (
                        <button onClick={() => setShowCart(!showCart)}
                            className="relative rounded-full bg-primary p-3 text-primary-foreground shadow-lg hover:bg-primary/90 transition-transform hover:scale-105">
                            <ShoppingCart className="h-6 w-6" />
                            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{itemCount}</span>
                        </button>
                    )}
                </div>

                {/* Floating Cart Panel */}
                {showCart && itemCount > 0 && (
                    <div className="fixed inset-x-2 top-16 z-50 mx-auto max-w-sm rounded-lg border bg-card p-4 shadow-xl sm:inset-x-auto sm:right-4 sm:left-auto sm:top-20 sm:w-80">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">Your Cart ({itemCount})</h3>
                            <button onClick={() => setShowCart(false)} className="rounded p-1 hover:bg-accent"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="max-h-60 space-y-2 overflow-y-auto">
                            {cartItems.map((item) => (
                                <div key={item.menuItem.id} className="flex items-center justify-between rounded border p-2 text-sm">
                                    <div className="flex-1 truncate"><span className="font-medium">{item.menuItem.name}</span></div>
                                    <div className="flex items-center gap-1 ml-2">
                                        <button onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)} className="rounded border p-0.5 hover:bg-accent"><Minus className="h-3 w-3" /></button>
                                        <span className="w-6 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)} className="rounded border p-0.5 hover:bg-accent"><Plus className="h-3 w-3" /></button>
                                    </div>
                                    <span className="ml-2 font-medium">₱{formatPrice(Number(item.menuItem.price) * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 border-t pt-3">
                            <div className="flex justify-between font-bold"><span>Total</span><span>₱{formatPrice(total)}</span></div>
                            <a href="/orders/create" className="mt-2 block w-full rounded-md bg-primary py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90">
                                Proceed to Checkout
                            </a>
                        </div>
                    </div>
                )}

                {categories.length === 0 ? (
                    <div className="text-center py-12"><p className="text-muted-foreground">No menu items available at the moment.</p></div>
                ) : (
                    <div className="flex flex-col gap-12">
                        {categories.map((category) => (
                            <section key={category.id} className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-semibold">{category.name}</h2>
                                    {category.description && <span className="text-muted-foreground text-sm">— {category.description}</span>}
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {category.menu_items.map((item) => {
                                        const inCart = getCartQty(item.id);
                                        return (
                                            <Card key={item.id} className="transition-all hover:shadow-md">
                                                {item.image_url && (
                                                    <div className="aspect-video w-full overflow-hidden rounded-t-lg cursor-pointer" onClick={() => handleItemClick(item)}>
                                                        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                                    </div>
                                                )}
                                                <CardHeader className="cursor-pointer" onClick={() => handleItemClick(item)}>
                                                    <div className="flex items-start justify-between">
                                                        <CardTitle className="text-lg">{item.name}</CardTitle>
                                                        {item.availability_status === 'limited' && <Badge variant="secondary" className="text-xs">Limited</Badge>}
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="cursor-pointer" onClick={() => handleItemClick(item)}>
                                                    <p className="text-muted-foreground line-clamp-2 text-sm">{item.description || 'No description available'}</p>
                                                    {item.allergens && item.allergens.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                            {item.allergens.map((a) => <Badge key={a} variant="outline" className="text-xs">{a}</Badge>)}
                                                        </div>
                                                    )}
                                                </CardContent>
                                                <CardFooter className="flex justify-between items-center">
                                                    <span className="text-lg font-semibold">₱{formatPrice(item.price)}</span>
                                                    {inCart > 0 ? (
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => updateQuantity(item.id, inCart - 1)} className="rounded-md border p-1 hover:bg-accent"><Minus className="h-4 w-4" /></button>
                                                            <span className="w-6 text-center font-medium">{inCart}</span>
                                                            <button onClick={() => updateQuantity(item.id, inCart + 1)} className="rounded-md border p-1 hover:bg-accent"><Plus className="h-4 w-4" /></button>
                                                        </div>
                                                    ) : (
                                                        <Button size="sm" onClick={() => addItem(item as any, 1)}>
                                                            <Plus className="mr-1 h-4 w-4" /> Add
                                                        </Button>
                                                    )}
                                                </CardFooter>
                                            </Card>
                                        );
                                    })}
                                </div>
                                {category.menu_items.length === 0 && <p className="text-muted-foreground py-4">No items available in this category</p>}
                            </section>
                        ))}
                    </div>
                )}

                {/* Sticky cart bar at bottom */}
                {itemCount > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card p-4 shadow-lg md:left-[var(--sidebar-width)]">
                        <div className="mx-auto flex max-w-4xl items-center justify-between">
                            <div><span className="font-semibold">{itemCount} item{itemCount > 1 ? 's' : ''}</span><span className="ml-2 text-muted-foreground">₱{formatPrice(total)}</span></div>
                            <a href="/orders/create" className="rounded-md bg-primary px-6 py-2 font-medium text-primary-foreground hover:bg-primary/90">
                                Checkout →
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Item Detail Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">{selectedItem?.name}</DialogTitle>
                        <DialogDescription className="text-base">{selectedItem?.category?.name}</DialogDescription>
                    </DialogHeader>
                    {selectedItem?.image_url && (
                        <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg">
                            <img src={selectedItem.image_url} alt={selectedItem.name} className="h-full w-full object-cover" />
                        </div>
                    )}
                    {selectedItem?.description && <p className="mb-4 text-muted-foreground">{selectedItem.description}</p>}
                    <div className="mb-4 flex items-center justify-between">
                        <span className="text-2xl font-bold">₱{formatPrice(selectedItem?.price ?? 0)}</span>
                        {selectedItem?.availability_status === 'limited' && <Badge variant="secondary">Limited Availability</Badge>}
                    </div>
                    {selectedItem?.nutritional_info && Object.keys(selectedItem.nutritional_info).length > 0 && (
                        <div className="mb-4">
                            <h4 className="mb-2 font-semibold">Nutritional Information</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {Object.entries(selectedItem.nutritional_info).map(([k, v]) => (
                                    <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>
                                ))}
                            </div>
                        </div>
                    )}
                    {selectedItem?.allergens && selectedItem.allergens.length > 0 && (
                        <div className="mb-4">
                            <h4 className="mb-2 font-semibold">Allergens</h4>
                            <div className="flex flex-wrap gap-2">{selectedItem.allergens.map((a) => <Badge key={a} variant="destructive">{a}</Badge>)}</div>
                        </div>
                    )}
                    <div className="mt-4 flex gap-2">
                        {selectedItem && (
                            <Button className="flex-1" onClick={() => { addItem(selectedItem as any, 1); setIsDialogOpen(false); }}>
                                <Plus className="mr-2 h-4 w-4" /> Add to Cart
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}