# Production Login Guide (Bitespace)

This guide explains how to access different parts of the platform in the production environment (`bitespace.netlify.app`).

## 1. Login as SUPER ADMIN (Global Platform)
The Super Admin manages the entire platform, including creating new merchants/tenants.

*   **URL:** `https://bitespace.netlify.app/login`
*   **Redirect after login:** `https://bitespace.netlify.app/super-admin`
*   **Note:** Use the root domain without any tenant slug.

---

## 2. Login as TENANT ADMIN (Store Owner)
The Store Owner manages products, orders, and settings for their specific store.

*   **URL:** `https://bitespace.netlify.app/[your-store-slug]/login`
    *   *Example:* `https://bitespace.netlify.app/cupcake-haven/login`
*   **Redirect after login:** `https://bitespace.netlify.app/[your-store-slug]/admin`
*   **Crucial:** You MUST include your store slug in the URL. If you login at the global `/login` page with a store owner account, you will see a "User not found" error because the system thinks you are a Platform Admin.

---

## 3. Login as TENANT STAFF
Staff members have limited access to manage orders and products within a specific store.

*   **URL:** `https://bitespace.netlify.app/[your-store-slug]/login`
    *   *Example:* `https://bitespace.netlify.app/cupcake-haven/login`
*   **Redirect after login:** `https://bitespace.netlify.app/[your-store-slug]/admin`
*   **Note:** The process is identical to the Store Owner; the system will automatically show the correct dashboard based on the employee's role.

---

## ⚠️ Troubleshooting & FAQ

### **"User not found" error during login?**
*   **Check the URL:** Are you trying to log in at `bitespace.netlify.app/login`? If you are a Store Admin, you **must** use your store's specific path (e.g., `/cupcake-haven/login`).
*   **Check Tenant context:** Ensure the store slug in the URL matches the store you were registered to.

### **How to access the dashboard after logging in?**
If you are logged in but lost the dashboard link:
*   **Super Admin:** `https://bitespace.netlify.app/super-admin`
*   **Store Admin/Staff:** `https://bitespace.netlify.app/[your-store-slug]/admin`

### **Logging out to switch accounts**
If you want to switch from a Customer account to an Admin account (or vice-versa) on the same store:
1.  Click your profile icon in the Navbar and select **Logout** (Keluar).
2.  Refresh the page and go to the `/login` URL again.
