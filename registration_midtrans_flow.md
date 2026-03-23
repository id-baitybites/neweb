# Merchant Registration & Midtrans Payment Flow

This document outlines the step-by-step process for registering a new merchant on the Baitybites platform and processing their subscription or registration fee using Midtrans.

## 1. Registration UI & Client Flow
**File:** `src/app/super-admin/tenants/new/page.tsx` (or a public-facing `/register` page)

1. The user fills out the Store Information (Name, Slug, Domain) and selects a **Subscription Plan** (e.g., Starter, Pro, Enterprise).
2. The user fills out the Initial Owner Account details (Name, Email, Password).
3. Upon form submission, the client calls the backend action (e.g., `registerTenant`).

## 2. Backend Action (Tenant Creation & Midtrans Snap)
**File:** `src/actions/tenant.ts`

Instead of immediately activating the tenant, the system securely generates a payment transaction:
1. Check if the chosen plan is a paid tier. (If FREE, directly activate the tenant).
2. Create the `Tenant` and `User` (Owner) in the database with an initial `status: 'PENDING_PAYMENT'`.
3. Generate a Midtrans `Snap` transaction using the `snap.createTransaction()` method:
   ```javascript
   const transaction = await snap.createTransaction({
       transaction_details: { 
           order_id: "REG-" + tenantId, 
           gross_amount: planPrice 
       },
       customer_details: { 
           first_name: ownerName, 
           email: ownerEmail 
       }
   });
   ```
4. Return the Midtrans `token` to the client.

## 3. Client Payment Trigger
**File:** `src/app/super-admin/tenants/new/page.tsx`

1. Upon receiving the successful response with a `midtransToken`, the frontend triggers the Midtrans Snap modal. This requires the Midtrans Snap JS script loaded in the document.
   ```javascript
   window.snap.pay(midtransToken, {
     onSuccess: function(result) {
       toast.success('Payment successful! Your store is now active.');
       router.push('/dashboard/onboarding'); // Redirect to merchant dashboard
     },
     onPending: function(result) {
       toast.info('Waiting for your payment...');
     },
     onError: function(result) {
       toast.error('Payment failed. Please try again.');
     }
   });
   ```

## 4. Midtrans Webhook (Callback) for Activation
**File:** `src/app/api/payment/callback/route.ts`

The Midtrans webhook endpoint currently handles order payments. For registrations, we implement conditional logic.

1. **Verify Signature**: Ensure the `signature_key` is valid.
2. **Check Identifier**: If the `order_id` starts with `REG-`, treat it as a tenant checkout.
3. **Update Status**: 
   - If `transaction_status` is `capture` or `settlement`, update the `Tenant` instance in Prisma to `ACTIVE`.
   - Send an automated email notification to the new merchant welcoming them to the platform.
   - Example logic:
     ```javascript
     if (orderId.startsWith('REG-')) {
         const tenantId = orderId.replace('REG-', '');
         if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
             await prisma.tenant.update({
                 where: { id: tenantId },
                 data: { status: 'ACTIVE' }
             });
             // Optionally trigger onboarding email
         }
         return NextResponse.json({ message: 'OK' });
     }
     ```

## 5. Security & Environment Considerations
- **Environment Separation**: Ensure `MIDTRANS_CLIENT_KEY` and `MIDTRANS_SERVER_KEY` correspond correctly to Sandbox (development) and Production environments locally and on Netlify.
- **Role Assignment Restrictions**: A user with the `OWNER` role should be restricted from accessing the main business management dashboard if their associated `Tenant`'s status is still `PENDING_PAYMENT`.
- **Database Schema**: Ensure a `status` or `subscriptionStatus` column exists in the `Tenant` model in `schema.prisma` to differentiate active tenants from pending ones.
