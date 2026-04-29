import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export type UserRole = 'admin' | 'manager' | 'staff' | 'student' | 'parent' | 'faculty';

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: UserRole;
    student_id?: string | null;
    grade_level?: string | null;
    section?: string | null;
    linked_student_id?: number | null;
    employee_id?: string | null;
    department?: string | null;
    salary_deduction_limit?: number;
    salary_deduction_current?: number;
    position?: string | null;
    phone?: string | null;
    is_active: boolean;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface MenuCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    sort_order: number;
    is_active: boolean;
    menu_items?: MenuItem[];
    menu_items_count?: number;
    created_at: string;
    updated_at: string;
}

export interface MenuItem {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    image_url: string | null;
    available_quantity: number;
    reserved_quantity: number;
    low_stock_threshold: number;
    availability_status: 'available' | 'limited' | 'sold_out';
    allergens: string[] | null;
    nutritional_info: Record<string, string> | null;
    daily_start_time: string | null;
    daily_end_time: string | null;
    is_available: boolean;
    is_featured: boolean;
    sort_order: number;
    category?: MenuCategory;
    ingredients?: MenuItemIngredient[];
    created_at: string;
    updated_at: string;
}

export interface MenuItemIngredient {
    id: number;
    menu_item_id: number;
    inventory_item_id: number | null;
    ingredient_name: string;
    quantity_required: number;
    unit: string;
}

export interface Order {
    id: number;
    user_id: number;
    order_number: string;
    subtotal: number;
    discount: number;
    total: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'refunded';
    payment_method: 'gcash' | 'cash' | 'salary_deduction' | null;
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    gcash_reference: string | null;
    notes: string | null;
    paid_at: string | null;
    served_at: string | null;
    user?: User;
    items?: OrderItem[];
    reservation?: Reservation;
    payment?: Payment;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: number;
    order_id: number;
    menu_item_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    special_instructions: string | null;
    menuItem?: MenuItem;
    menu_item?: MenuItem;
}

export interface Reservation {
    id: number;
    user_id: number;
    order_id: number | null;
    menu_item_id: number;
    quantity: number;
    qr_code: string;
    qr_code_expires_at: string | null;
    reserved_pickup_time: string;
    status: 'pending' | 'confirmed' | 'redeemed' | 'expired' | 'cancelled';
    redeemed_at: string | null;
    user?: User;
    order?: Order;
    menuItem?: MenuItem;
    menu_item?: MenuItem;
    created_at: string;
    updated_at: string;
}

export interface Payment {
    id: number;
    order_id: number;
    user_id: number;
    amount: number;
    payment_method: 'gcash' | 'cash' | 'salary_deduction';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    gcash_reference: string | null;
    gcash_mobile_number: string | null;
    transaction_id: string | null;
    notes: string | null;
    completed_at: string | null;
    order?: Order;
    user?: User;
}

export interface InventoryItem {
    id: number;
    name: string;
    sku: string;
    category: string;
    current_quantity: number;
    minimum_quantity: number;
    unit: string;
    unit_cost: number | null;
    supplier_id: number | null;
    low_stock_alert: boolean;
    is_active: boolean;
    supplier?: Supplier;
    created_at: string;
    updated_at: string;
}

export interface InventoryTransaction {
    id: number;
    inventory_item_id: number;
    user_id: number;
    type: 'addition' | 'deduction' | 'adjustment' | 'wastage';
    quantity: number;
    quantity_before: number;
    quantity_after: number;
    reference: string | null;
    notes: string | null;
    user?: User;
    inventory_item?: InventoryItem;
    created_at: string;
}

export interface Supplier {
    id: number;
    name: string;
    contact_person: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    is_active: boolean;
}

export interface SalaryDeduction {
    id: number;
    user_id: number;
    order_id: number;
    amount: number;
    running_total: number;
    monthly_limit: number;
    payroll_month: string;
    payroll_year: string;
    user?: User;
    order?: Order;
}

export interface CartItem {
    menuItem: MenuItem;
    quantity: number;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface AppNotification {
    id: string;
    data: {
        title: string;
        message: string;
        url: string;
        icon: string;
        type: string;
        order_number?: string;
        status?: string;
        item_name?: string;
    };
    read_at: string | null;
    created_at: string;
    time_ago?: string;
}

export interface ChatUser {
    id: number;
    name: string;
    avatar?: string | null;
    role: string;
    email?: string;
}

export interface ChatMessage {
    id: number;
    body: string;
    sender_id: number;
    sender_name: string;
    sender_avatar?: string | null;
    read_at: string | null;
    created_at: string;
    time: string;
}

export interface ChatConversation {
    id: number;
    other_user: ChatUser;
    last_message: {
        body: string;
        sender_id: number;
        created_at: string;
        time_ago: string;
    } | null;
    unread_count: number;
}
