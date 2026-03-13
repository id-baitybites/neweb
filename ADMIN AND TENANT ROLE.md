# ADMIN AND TENANT ROLES

The StoreOS platform utilizes a single codebase designed for a multi-tenant environment. To ensure strict data privacy and provide different levels of platform control, the system uses two main administrative categories: **Super Admins** and **Tenant Admins**.

---

## 🌎 1. Super Admin 
> **Role value in Database**: `SUPER_ADMIN`  
> **Tenant Assignment**: `tenantId = null`  
> **Dashboard**: `/super-admin`

The Super Admin is the owner, creator, or maintainer of the entire SaaS platform. They function strictly outside the boundaries of any specific retail store.

### Capabilities & Responsibilities:
- **Global Settings & Overview**: See cross-platform metrics such as the total number of stores utilizing the SaaS, and absolute total users (Customers + Staff) interacting with the service.
- **Tenant Enrollment**: Create completely new tenants. When a new business wants to join StoreOS, the Super Admin registers them on the platform and assigns them a custom Subdomain (e.g. `bakery.bitespace.netlify.app`).
- **Subscription Administration**: Set or alter the pricing plan a tenant is on (e.g. upgrading them from the 'Free' tier to the 'Enterprise' tier).
- **Access Control (Kill Switch)**: Super Admins can flip a tenant's `isActive` status. This instantly suspends the storefront, locking out the staff from the backend and rendering the consumer checkout offline.

### Strict Limitations:
- Super Admins **never** participate in the day-to-day operations of an individual store. 
- They cannot add retail products, monitor kitchen tickets, or look at individual POS receipts.

---

## 🏪 2. Tenant Administrators (Store Owners & Staff)
> **Role values in Database**: `OWNER` | `STAFF`  
> **Tenant Assignment**: `tenantId = "unique-store-identifier"`  
> **Dashboard**: `/admin`

Tenant Administrators are the franchise or small-business operators. Their accounts and all data they interact with are cryptographically enclosed within their single Tenant boundaries. 

### The `OWNER` Role
The `OWNER` holds full administrative privileges over their specific storefront.
- **Store Configuration**: Owners control `/admin/settings` where they configure fundamental business logic (Min Pre-order days, operating Timezone, Delivery Fees, and Language formatters).
- **Personalization**: They can deeply configure the visual theme, altering Primary/Secondary active colors and changing the default global Google Font (e.g. shifting from 'Inter' to 'Playfair Display') to inject pure brand aesthetics into the frontend Web component.
- **Financial Access**: Owners are generally the only ones meant to examine the comprehensive financial reports & revenue forecasting dashboards.

### The `STAFF` Role
The `STAFF` role embodies the working employees (Cashiers, Bakers, Line Cooks).
- **Point of Sale (POS)**: Native access to ring up cash/offline customers at `/admin/pos` without affecting public web traffic.
- **Kitchen Display System (KDS)**: Seamlessly update web orders streaming in via `/admin/kitchen`—moving tickets across 'Processing', 'Ready', and 'Completed' lanes.
- **Inventory & Menu Control**: Capable of pushing new Cakes/Products live on the `/products` page, as well as deducting bulk units of raw materials (Flour, Vanilla, Boxes) natively via the Inventory modules.

### Strict Limitations:
- **Absolute Tenant Privacy**: An Owner or Staff member from 'Store A' is fundamentally blocked from visualizing the data, product catalogs, order pipelines, or configurations belonging to 'Store B'.
- **Routing Boundaries**: Middleware intercepts a Tenant Admin trying to visit `/super-admin` and safely ejects them back to the Home page organically.
