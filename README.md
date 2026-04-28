# 🍽️ School Canteen Management System (SMS)

A comprehensive, full-stack web application for managing school canteen operations — from menu management and order processing to inventory tracking, payment handling, and revenue reporting. Built with **Laravel 12**, **Inertia.js**, **React 19**, and **TypeScript**.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Database Schema](#-database-schema)
- [User Roles & Permissions](#-user-roles--permissions)
- [Module Breakdown](#-module-breakdown)
- [API Routes](#-api-routes)
- [Project Structure](#-project-structure)
- [Seeded Test Data](#-seeded-test-data)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

The School Canteen Management System digitizes the entire canteen workflow for a school environment. It replaces paper-based ordering, manual inventory counts, and cash-only transactions with a streamlined digital platform that supports six distinct user roles, three payment methods, QR-code-based reservations, and real-time inventory tracking with automatic deduction.

### Key Highlights

- **Role-Based Access Control (RBAC)** — 6 roles with isolated dashboards and permissions
- **Complete Order Lifecycle** — Browse menu → Add to cart → Checkout → Pay → Prepare → Serve
- **Smart Inventory** — Auto-deducts raw materials when orders are served, based on ingredient recipes
- **Multi-Payment Support** — GCash, Cash (both confirmed at counter by staff), and Salary Deduction (in-app with limit enforcement for faculty)
- **QR Code Reservations** — Students/faculty reserve meals and present auto-generated QR codes for pickup
- **Revenue Analytics** — Payment method breakdown, faculty deduction tracking, CSV exports
- **Real-time Notifications** — In-app alerts for orders, payments, inventory, and reservations
- **Chat/Messaging** — Direct messaging between users within the system
- **User Avatars** — Profile image support for all user types

---

## ✨ Features

### 🔐 Authentication & Authorization
- Secure login, registration, and password reset via Inertia.js
- **Dual middleware system**: `RoleMiddleware` for dashboard routing + `PermissionMiddleware` for granular access control
- **19 granular permissions** assigned to 6 roles via a `role_permission` pivot table
- Admin UI for customizing role-permission assignments at runtime
- Smart dashboard redirection — each role lands on their specific dashboard after login
- Session-based authentication with CSRF protection
- Admin role has superuser access (always passes all permission checks)

### 🍲 Menu Management (Admin / Manager)
- Full CRUD for menu items and categories
- Ingredient recipe linking (connects menu items to raw inventory materials)
- Availability toggling and stock quantity management
- Allergen tagging and nutritional information
- Image URL support for menu item photos
- Featured item flagging and sort ordering

### 🛒 Ordering System (All Authenticated Users)
- Browse menu with category-organized layout
- Add-to-cart with inline quantity controls on each menu card
- Floating cart panel and sticky checkout bar
- Cart persistence via `localStorage`
- Payment method selection at checkout:
  - **Cash** — Pay at the counter, staff confirms
  - **GCash** — Show transfer at the counter, staff confirms
  - **Salary Deduction** — Faculty only, auto-processed with real-time limit display
- Optional pickup time selection for reservations
- Order notes / special instructions

### 📱 QR Code Reservations
- Auto-generated unique QR codes on order creation (when pickup time is set)
- QR codes displayed on order detail page using `qrcode.react`
- Staff redemption via QR code input on the kitchen dashboard
- Expiration tracking (2-hour default window)
- Redemption triggers automatic inventory deduction

### 💰 Payment Processing
- **Cash & GCash**: Staff-confirmed at the counter — identical flow for both
  - GCash reference number capture
  - Cash received amount with automatic change calculation
- **Salary Deduction**: Fully automated in-app processing
  - Monthly limit enforcement per faculty member
  - Running total tracking across the pay period
  - Real-time remaining balance display at checkout

### 📦 Inventory Management (Admin / Manager)
- CRUD for raw material items with SKU, category, and unit tracking
- Stock level monitoring with low-stock and out-of-stock visual indicators
- Manual stock addition with transaction logging
- Supplier linking
- Active alert panel with acknowledgment workflow
- **Auto-deduction**: When an order is served, the system automatically deducts ingredient quantities from inventory based on the `menu_item_ingredients` recipe table

### 👥 User Management (Admin / Manager)
- Full CRUD with role-specific form fields:
  - Students: Student ID, grade level, section
  - Faculty: Employee ID, department, salary deduction limit
  - Parents: Linked student account
- CSV bulk import with validation and error reporting
- Search and filter by role
- Active/inactive status management

### 📊 Revenue Dashboard (Admin / Manager)
- Total revenue with order count
- Payment method breakdown (GCash / Cash / Salary Deduction) with visual percentage bar
- Date range filtering
- Recent paid orders feed
- Faculty salary deduction usage table with progress bars and near-limit warnings
- CSV export of revenue data

### 👨‍🍳 Kitchen Dashboard (Staff)
- Real-time order queue with status cards (New → Preparing → Ready → Served)
- One-click status progression buttons using Inertia `router.patch()`
- QR code redemption input for reservation pickup
- Payment confirmation modal (GCash reference / cash with change calculation)
- Low-stock inventory alerts panel

### 🔔 Notifications System (All Authenticated Users)
- Real-time in-app notifications for:
  - New orders received
  - Order status changes
  - Payment confirmations
  - Reservation redemptions
  - Low stock alerts
- Polling-based updates via `/api/notifications/poll`
- Mark as read / mark all as read functionality
- Notification type-based styling

### 💬 Chat/Messaging System (All Authenticated Users)
- Direct messaging between any two users
- Conversation-based threading
- Real-time polling for new messages
- Unread message indicators
- Search users to start new conversations
- Message read receipts

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Backend Framework** | Laravel | 12.x |
| **Frontend Framework** | React | 19.x |
| **Language** | TypeScript | 5.7 |
| **Bridge** | Inertia.js | 2.x |
| **Styling** | Tailwind CSS | 4.x |
| **UI Components** | shadcn/ui (Radix primitives) | — |
| **Icons** | Lucide React | 0.475 |
| **QR Codes** | qrcode.react | — |
| **Build Tool** | Vite | 6.x |
| **Database** | PostgreSQL / SQLite | — |
| **PHP** | PHP | ≥ 8.2 |

---

## 🏗️ Architecture

The application follows a **modular monolith** architecture pattern:

```
┌─────────────────────────────────────────────────────┐
│                    Browser (React)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │  Menu     │ │  Orders  │ │  Admin   │ │ Kitchen │ │
│  │  Browse   │ │  Cart    │ │  Panels  │ │ Dash    │ │
│  └──────────┘ └──────────┘ └──────────┘ └─────────┘ │
├─────────────────────────────────────────────────────┤
│              Inertia.js (SSR Bridge)                 │
├─────────────────────────────────────────────────────┤
│                 Laravel (PHP)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │  Menu    │ │  Order   │ │  Admin   │ │ Payment │ │
│  │  Module  │ │  Module  │ │  Module  │ │ Module  │ │
│  └──────────┘ └──────────┘ └──────────┘ └─────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │Inventory │ │ Revenue  │ │ Reserv.  │             │
│  │  Module  │ │  Module  │ │  Module  │             │
│  └──────────┘ └──────────┘ └──────────┘             │
├─────────────────────────────────────────────────────┤
│          PostgreSQL / SQLite Database                 │
│  Users · MenuItems · Orders · Inventory · Payments   │
└─────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Inertia.js** — No REST API needed; server-side controllers return React page components directly with props
2. **Dual Authorization** — `RoleMiddleware` handles dashboard routing; `PermissionMiddleware` enforces granular access per route
3. **Roles + Permissions** — Users have one role → each role maps to N permissions via `role_permission` pivot. Permissions shared to frontend via `HandleInertiaRequests`
4. **Smart Redirect** — `RedirectController` dispatches authenticated users to their role-specific dashboard
5. **Cart in LocalStorage** — Client-side cart state via custom `useCart` hook; persists across page navigations
6. **Cashier-Confirmed Payments** — GCash and Cash are both handled at the physical counter; only salary deduction is processed in-app

---

## 🚀 Getting Started

### Prerequisites

- **PHP** ≥ 8.2 with extensions: `pdo`, `mbstring`, `openssl`, `tokenizer`, `xml`
- **Composer** ≥ 2.x
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **PostgreSQL** ≥ 14 (or SQLite for development)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd sms

# 2. Install PHP dependencies
composer install

# 3. Install Node.js dependencies
npm install

# 4. Environment setup
cp .env.example .env
php artisan key:generate
```

### Database Configuration

**Option A: SQLite (Quick Start)**
```bash
# SQLite is the default — no extra config needed
touch database/database.sqlite
```

**Option B: PostgreSQL (Recommended for Production)**
```env
# Edit .env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=sms
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### Run Migrations & Seed

```bash
php artisan migrate:fresh --seed
```

This creates all tables and populates sample data including:
- 6 roles with 19 permissions and a default permission matrix
- 6 user accounts (one per role)
- 3 menu items across 2 categories
- 8 inventory items with a supplier
- Ingredient recipe links for auto-deduction

### Start Development Server

```bash
# Option 1: Run all services concurrently
composer dev

# Option 2: Run separately in different terminals
php artisan serve        # Backend at http://localhost:8000
npm run dev              # Vite dev server with HMR
```

Visit **http://localhost:8000** in your browser.

---

## 🗄️ Database Schema

### Entity Relationship Overview

```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--o{ Reservation : makes
    User ||--o{ Payment : receives
    User ||--o{ SalaryDeduction : has
    User }o--|| User : "parent links to student"

    MenuCategory ||--o{ MenuItem : contains
    MenuItem ||--o{ MenuItemIngredient : "has recipe"
    MenuItem ||--o{ OrderItem : "ordered as"
    MenuItem ||--o{ Reservation : "reserved for"

    InventoryItem ||--o{ MenuItemIngredient : "used in"
    InventoryItem ||--o{ InventoryTransaction : tracks
    InventoryItem ||--o{ InventoryAlert : triggers
    Supplier ||--o{ InventoryItem : supplies

    Order ||--o{ OrderItem : contains
    Order ||--o| Reservation : "may have"
    Order ||--o| Payment : "paid via"
    Order ||--o| SalaryDeduction : "deducted from"
```

### Tables (10 Migrations)

| Table | Description |
|---|---|
| `users` | All users with role, student/employee IDs, salary deduction fields |
| `roles` | Role definitions (admin, manager, staff, etc.) with display names |
| `permissions` | Permission definitions grouped by feature area |
| `role_permission` | Pivot table mapping roles to their granted permissions |
| `menu_categories` | Menu sections (Main Dishes, Drinks, etc.) |
| `menu_items` | Individual food/drink items with pricing, stock, allergens |
| `menu_item_ingredients` | Recipe links — maps menu items to inventory raw materials |
| `orders` | Order header with totals, status, payment method |
| `order_items` | Line items within an order |
| `reservations` | QR-coded meal reservations with pickup times |
| `payments` | Payment records (GCash ref, cash received, completion time) |
| `salary_deductions` | Faculty salary deduction ledger entries |
| `inventory_items` | Raw materials with stock levels, SKU, supplier |
| `inventory_transactions` | Audit trail of all stock movements |
| `inventory_alerts` | Low-stock and out-of-stock notifications |
| `suppliers` | Supplier contact information |
| `notifications` | User notifications (order, payment, inventory alerts) |
| `conversations` | Chat conversation threads between users |
| `messages` | Individual chat messages with read receipts |

---

## 👤 User Roles & Permissions

The system uses a **Roles + Permissions** architecture. Each user has one role, and each role is assigned a set of granular permissions. Admins can customize role-permission assignments at runtime via the **Roles & Permissions** admin page.

### Roles Overview

| Role | Dashboard | Can Order | Admin Panels | Kitchen |
|---|---|---|---|---|
| **Admin** | Overview stats | ✅ | All (superuser) | ❌ |
| **Manager** | Overview stats | ✅ | Menu, Inventory, Revenue (not Users by default) | ❌ |
| **Staff** | Kitchen queue | ❌ | ❌ | ✅ Order status, QR scan, payment confirm |
| **Faculty** | Personal orders + deduction info | ✅ (+ salary deduction) | ❌ | ❌ |
| **Student** | Personal orders | ✅ | ❌ | ❌ |
| **Parent** | Linked student orders | ✅ | ❌ | ❌ |

### Default Permission Matrix (19 Permissions)

| Permission | Admin | Manager | Staff | Faculty | Student | Parent |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `view_admin_dashboard` | ✅ | ✅ | | | | |
| `manage_menu` | ✅ | ✅ | | | | |
| `manage_categories` | ✅ | ✅ | | | | |
| `manage_users` | ✅ | | | | | |
| `import_users` | ✅ | | | | | |
| `manage_inventory` | ✅ | ✅ | | | | |
| `add_inventory_stock` | ✅ | ✅ | ✅ | | | |
| `view_revenue` | ✅ | ✅ | | | | |
| `export_revenue` | ✅ | ✅ | | | | |
| `manage_deduction_limits` | ✅ | ✅ | | | | |
| `view_kitchen` | ✅ | | ✅ | | | |
| `update_order_status` | ✅ | | ✅ | | | |
| `confirm_payment` | ✅ | | ✅ | | | |
| `redeem_reservation` | ✅ | | ✅ | | | |
| `place_order` | ✅ | ✅ | | ✅ | ✅ | ✅ |
| `view_own_orders` | ✅ | ✅ | | ✅ | ✅ | ✅ |
| `use_salary_deduction` | ✅ | | | ✅ | | |
| `browse_menu` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `manage_roles` | ✅ | | | | | |

### How Permissions Work

```
User (role: 'manager') → Role model → role_permission pivot → Permission checks
```

1. **Backend**: Routes use `permission:manage_menu` middleware instead of `role:admin,manager`
2. **Frontend**: Permissions array shared via Inertia; sidebar items render based on `permissions.includes('manage_menu')`
3. **Admin override**: Admin role always passes all permission checks (superuser in `HasPermissions` trait)
4. **Runtime customizable**: Admins can toggle permissions per role via `/admin/roles`

### Sidebar Navigation (Permission-Based)

Sidebar items are dynamically rendered based on the user's permissions:
- Dashboard link (always shown)
- Menu Management → requires `manage_menu`
- Users → requires `manage_users`
- Inventory → requires `manage_inventory`
- Revenue → requires `view_revenue`
- Roles & Permissions → requires `manage_roles`
- Browse Menu → requires `browse_menu`
- My Orders → requires `view_own_orders`
- Reservations → requires `view_own_orders`

---

## 📦 Module Breakdown

### Controllers (17 total)

| Controller | Routes | Permission Required |
|---|---|---|
| `RedirectController` | `GET /dashboard` | (auth only) |
| `MenuController` | `GET /menu` | (public) |
| `OrderController` | `/orders/*` | `place_order`, `view_own_orders` |
| `ReservationController` | `/reservations/*` | `view_own_orders` + `redeem_reservation` |
| `PaymentController` | Staff confirm payment | `confirm_payment` |
| `AdminMenuController` | `/admin/menu/*` | `manage_menu`, `manage_categories` |
| `AdminUserController` | `/admin/users/*` | `manage_users`, `import_users` |
| `InventoryController` | `/admin/inventory/*` | `manage_inventory`, `add_inventory_stock` |
| `RevenueController` | `/admin/revenue/*` | `view_revenue`, `export_revenue` |
| `RolePermissionController` | `/admin/roles/*` | `manage_roles` |
| `NotificationController` | `/notifications/*` | (auth only) |
| `ChatController` | `/chat/*` | (auth only) |
| `SalaryDeductionController` | `/admin/salary-deductions/*` | `manage_deduction_limits` |
| `AdminDashboardController` | `GET /admin/dashboard` | `view_admin_dashboard` |
| `StaffDashboardController` | `GET /staff/dashboard` | `view_kitchen` |
| `FacultyDashboardController` | `GET /faculty/dashboard` | (role: faculty) |
| `CustomerDashboardController` | `GET /customer/dashboard` | (role: student, parent) |

### Models (17 total)

`User` · `Role` · `Permission` · `MenuCategory` · `MenuItem` · `MenuItemIngredient` · `Order` · `OrderItem` · `Reservation` · `Payment` · `SalaryDeduction` · `InventoryItem` · `InventoryTransaction` · `InventoryAlert` · `Supplier` · `Conversation` · `Message`

### React Pages (15+ pages)

```
resources/js/pages/
├── dashboard/
│   ├── admin.tsx          # Admin/Manager overview
│   ├── staff.tsx          # Kitchen order queue + QR scanner
│   ├── faculty.tsx        # Faculty orders + deduction status
│   └── customer.tsx       # Student/Parent order history
├── menu/
│   └── index.tsx          # Public menu with cart integration
├── orders/
│   ├── index.tsx          # Order history list
│   ├── create.tsx         # Checkout page
│   └── show.tsx           # Order detail with QR code
├── admin/
│   ├── menu/
│   │   ├── index.tsx      # Menu item management table
│   │   └── form.tsx       # Create/edit menu item form
│   ├── users/
│   │   └── index.tsx      # User management + CSV import
│   ├── inventory/
│   │   └── index.tsx      # Stock levels + alerts
│   ├── revenue/
│   │   └── index.tsx      # Revenue dashboard + charts
│   └── roles/
│       └── index.tsx      # Role-permission matrix management
└── auth/                  # Login, Register, Password Reset
```

---

## 🛣️ API Routes

### Public Routes
| Method | URI | Description |
|---|---|---|
| `GET` | `/menu` | Browse menu |
| `GET` | `/menu/{menuItem}` | Menu item detail |

### Notification Routes (All Authenticated)
| Method | URI | Description |
|---|---|---|
| `GET` | `/notifications` | List notifications |
| `GET` | `/api/notifications/poll` | Poll for new notifications |
| `PATCH` | `/notifications/{id}/read` | Mark as read |
| `POST` | `/notifications/mark-all-read` | Mark all as read |

### Chat Routes (All Authenticated)
| Method | URI | Description |
|---|---|---|
| `GET` | `/chat` | List conversations |
| `GET` | `/chat/{conversation}` | View conversation |
| `POST` | `/chat/start/{user}` | Start new conversation |
| `POST` | `/chat/{conversation}/messages` | Send message |
| `GET` | `/api/chat/{conversation}/poll` | Poll for new messages |
| `GET` | `/api/chat/poll` | Poll for new conversations |
| `POST` | `/chat/{conversation}/read` | Mark as read |
| `GET` | `/api/chat/users` | Search users to chat with |

### Authenticated Routes (All Roles)
| Method | URI | Description |
|---|---|---|
| `GET` | `/dashboard` | Smart redirect to role-specific dashboard |
| `GET` | `/orders` | Order history |
| `GET` | `/orders/create` | Checkout page |
| `POST` | `/orders` | Place order |
| `GET` | `/orders/{order}` | Order detail |
| `GET` | `/reservations` | My reservations |

### Permission-Gated Routes
| Method | URI | Permission | Description |
|---|---|---|---|
| `GET` | `/admin/dashboard` | `view_admin_dashboard` | Admin dashboard |
| `GET/POST` | `/admin/menu` | `manage_menu` | List / Create menu items |
| `GET` | `/admin/menu/create` | `manage_menu` | New item form |
| `GET/PUT` | `/admin/menu/{id}/edit` | `manage_menu` | Edit item form |
| `DELETE` | `/admin/menu/{id}` | `manage_menu` | Delete item |
| `PATCH` | `/admin/menu/{id}/toggle` | `manage_menu` | Toggle availability |
| `GET/POST` | `/admin/categories` | `manage_categories` | Category management |
| `GET/POST` | `/admin/users` | `manage_users` | List / Create users |
| `PUT/DELETE` | `/admin/users/{id}` | `manage_users` | Update / Delete user |
| `POST` | `/admin/users/import` | `import_users` | CSV bulk import |
| `GET/POST` | `/admin/inventory` | `manage_inventory` | List / Create inventory |
| `POST` | `/admin/inventory/{id}/add-stock` | `add_inventory_stock` | Add stock |
| `PATCH` | `/admin/inventory/alerts/{id}` | `manage_inventory` | Acknowledge alert |
| `GET` | `/admin/revenue` | `view_revenue` | Revenue dashboard |
| `GET` | `/admin/revenue/export` | `export_revenue` | Export CSV |
| `GET` | `/admin/roles` | `manage_roles` | Role-permission matrix |
| `PUT` | `/admin/roles/{id}/permissions` | `manage_roles` | Update role permissions |
| `GET` | `/staff/dashboard` | `view_kitchen` | Kitchen dashboard |
| `PATCH` | `/staff/orders/{id}/status` | `update_order_status` | Update order status |
| `POST` | `/staff/orders/{id}/confirm-payment` | `confirm_payment` | Confirm GCash/Cash |
| `POST` | `/staff/reservations/redeem` | `redeem_reservation` | Redeem QR code |
| `GET` | `/orders` | `view_own_orders` | Order history |
| `GET/POST` | `/orders/create` | `place_order` | Checkout & place order |

### Salary Deduction Routes (Admin/Manager)
| Method | URI | Permission | Description |
|---|---|---|---|
| `GET` | `/admin/salary-deductions` | `manage_deduction_limits` | List all faculty deductions |
| `GET` | `/admin/salary-deductions/{user}` | `manage_deduction_limits` | Faculty deduction details |
| `PATCH` | `/admin/salary-deductions/{user}/limit` | `manage_deduction_limits` | Update deduction limit |

---

## 📁 Project Structure

```
sms/
├── app/
│   ├── Http/
│   │   ├── Controllers/       # 17 controllers + Auth/Settings
│   │   └── Middleware/
│   │       ├── RoleMiddleware.php       # Role-based dashboard routing
│   │       └── PermissionMiddleware.php # Granular permission checks
│   ├── Models/                # 17 Eloquent models (incl. Role, Permission, Conversation, Message)
│   ├── Traits/
│   │   └── HasPermissions.php  # Permission checking trait for User model
│   └── Notifications/        # Notification classes (6 types)
├── database/
│   ├── migrations/            # 13 migration files
│   ├── seeders/               # RolePermission, User, Menu, Inventory seeders
│   └── factories/
├── resources/js/
│   ├── components/            # Reusable UI (sidebar, nav, shadcn/ui)
│   ├── hooks/
│   │   └── use-cart.ts        # Cart state management
│   ├── layouts/               # App layout with sidebar
│   ├── pages/                 # All Inertia page components
│   └── types/
│       └── index.ts           # Full TypeScript interfaces
├── routes/
│   ├── web.php                # All routes (permission-gated)
│   ├── auth.php               # Authentication routes
│   └── settings.php           # User settings routes
└── public/build/              # Compiled production assets
```

---

## 🧪 Seeded Test Data

After running `php artisan migrate:fresh --seed`, the following test data is available:

### User Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `password` |
| Manager | `manager@example.com` | `password` |
| Staff | `staff@example.com` | `password` |
| Faculty | `faculty@example.com` | `password` |
| Student | `student@example.com` | `password` |
| Parent | `parent@example.com` | `password` |

### Menu Items
- **Main Dishes**: Chicken Adobo (₱120), Pork Sinigang (₱150)
- **Drinks**: Iced Lemon Tea (₱45)

### Inventory
- 8 raw materials: Rice, Chicken, Pork Belly, Soy Sauce, Vinegar, Cooking Oil, Tea Leaves, Tamarind Mix
- 1 Supplier: Fresh Market Supplies
- Ingredient recipes linked to Chicken Adobo and Pork Sinigang

### Faculty Deduction
- Faculty user has ₱2,000 monthly deduction limit with ₱150 already used

### Roles & Permissions
- 6 system roles with `is_system = true` (cannot be deleted)
- 19 permissions grouped by feature area (dashboard, menu, users, inventory, revenue, kitchen, ordering, general, system)
- Default permission matrix pre-configured as shown in the Permissions section above

---

## 💻 Development

### Available Scripts

```bash
# Start all dev services (Laravel + Queue + Vite)
composer dev

# Or run individually:
php artisan serve          # PHP dev server at :8000
npm run dev                # Vite HMR at :5173

# Build for production
npm run build

# Code formatting
npm run format             # Format with Prettier
npm run lint               # Lint with ESLint

# Database
php artisan migrate:fresh --seed    # Reset & reseed
php artisan tinker                  # Interactive REPL
```

### Adding a New Feature

1. **Model**: Create/modify Eloquent model in `app/Models/`
2. **Migration**: `php artisan make:migration create_xyz_table`
3. **Controller**: Create in `app/Http/Controllers/`
4. **Permission**: Add new permission in `RolePermissionSeeder` and assign to roles
5. **Route**: Add to `routes/web.php` with `permission:your_permission` middleware
6. **Types**: Add TypeScript interface to `resources/js/types/index.ts`
7. **Page**: Create React component in `resources/js/pages/`
8. **Sidebar**: Check permission in `components/app-sidebar.tsx` to show/hide nav link

### Key Conventions

- **Inertia Rendering**: Controllers return `Inertia::render('page/path', [...props])`
- **Form Submission**: Use `router.post()` / `router.put()` / `router.patch()` from `@inertiajs/react`
- **Validation**: Server-side validation in controllers; errors auto-propagated to frontend via Inertia
- **Flash Messages**: `back()->with('success', '...')` for success notifications
- **Currency**: Philippine Peso (₱) — all monetary values stored as `decimal(10,2)`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is open-sourced software licensed under the [MIT License](https://opensource.org/licenses/MIT).
