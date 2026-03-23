# QRIS Integration Documentation

## Overview
This platform utilizes Midtrans as its primary payment gateway. Following the recent implementation updates, the platform streamlines the core checkout process to exclusively serve **QRIS** (Quick Response Code Indonesian Standard). QRIS is currently the most popular, efficient, and standardized cashless payment solution across Indonesia, accessible via a massive variety of e-wallets (GoPay, OVO, Dana, ShopeePay) and Mobile Banking apps (BCA, Mandiri, BNI, etc.).

## 1. Checkout Implementation (Server Action)
**File Location:** `src/actions/order.ts`

When a customer checks out their cart, the platform invokes a Next.js Server Action (`createOrder`). 
We communicate with the Midtrans Snap API to generate a transaction token. To enforce that the user is immediately prompted with a QR code instead of standard credit card forms, the `enabled_payments` parameter is rigidly defined:

```typescript
const parameter = {
    transaction_details: {
        order_id: order.id,
        gross_amount: total,
    },
    // ...other parameters like item_details & customer_details...
    
    // Explicitly restrict the Midtrans Snap UI to QRIS only
    enabled_payments: ["qris"],
}

const transaction = await snap.createTransaction(parameter)
```
When this token is returned to the client, calling `window.snap.pay(token)` will immediately display the QR code block for the user to scan.

## 2. Webhook & Callback Handling
**File Location:** `src/app/api/payment/callback/route.ts`

Unlike synchronous payment methods (like Credit Cards returning an instant `capture` status on success), QRIS transactions are primarily asynchronous. 

When the user scans the barcode and completes payment on their mobile device:
1. Midtrans fires a background webhook `POST` request to our `/api/payment/callback` route.
2. The payload contains `transaction_status: "settlement"`.
3. The platform verifies the `signature_key` using our secret (`MIDTRANS_SERVER_KEY`).
4. Upon successful validation, the system marks the database order payment status as `PAID` and updates its functional order state to `PROCESSING`.
5. An automated confirmation email is immediately dispatched to the customer.

### QRIS Statuses you may receive:
- `pending`: The QRIS code was generated successfully and is awaiting customer scan.
- `settlement`: The customer successfully scanned the QR Code and the funds were cleared.
- `expire`: The QRIS invoice timed out.

## 3. Testing in Sandbox mode
When developing locally with Sandbox keys, Midtrans does not require an actual e-wallet scan from your smartphone to test QRIS workflows:

1. Create a dummy order on your local server.
2. The Snap popup will load the dummy QRIS barcode.
3. You can utilize the **[Midtrans Simulator](https://simulator.sandbox.midtrans.com/qris/index)**.
4. Trigger a "Success" payment from the simulator GUI. 
5. This simulates a mobile app scan and will fire the webhook to your site (make sure you connect Midtrans webhooks to your local machine using tools like Ngrok).

## 4. Future Considerations
If you wish to re-enable direct GoPay deep-links or ShopeePay jumping in mobile application environments alongside standard static QRIS codes, you can broaden your array:
```typescript
enabled_payments: ["qris", "gopay", "shopeepay"]
```
