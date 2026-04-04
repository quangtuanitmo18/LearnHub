# Sales & Payment Module Documentation

## Overview
The **Sales & Payment** domain is responsible for all e-commerce aspects of the LearnHub platform, handling shopping baskets, discount logic, checkout procedures, and secure transaction verification. 

This domain consists of four interconnected NestJS modules located in `server/src/modules`:
- `CartModule`
- `CouponModule`
- `OrderModule`
- `PaymentModule`

---

## 1. Cart & Coupon Management
- **Persistent Shopping Cart:** The `CartModule` maintains active shopping carts for users, synchronizing their selected courses. Whenever a successful checkout executes, the items are automatically cleared from the cart.
- **Dynamic Coupon Engine:** The `CouponModule` supports both Fixed Amount and Percentage (`PERCENT`) discounts. It strictly validates criteria such as `minPurchaseAmount`, `maxUses`, date ranges, and can be optionally locked to **specific courses** (many-to-many relationship) to prevent users from applying discounts globally to untargeted courses.

---

## 2. Order Module & Checkout Pipeline
The checkout pipeline acts as the single gateway for converting carts/memberships into purchasable invoices.

### Checkout Validation Guardrails
- **Double-Charge Protection:** Before creating an order, `hasUserPurchasedCourse` is called to prevent users from accidentally buying a course they already own or currently hold lifetime access to.
- **Auto-Cancellation (BullMQ):** Unpaid pending orders hold state and coupon reserves. To prevent DB bloating and coupon-hoarding, `OrderQueueService` dispatches a BullMQ Job (`CANCEL_UNPAID_ORDER`) with a 24-hour delay when an order is created. If payment is received, the job is cleanly removed; if not, the delayed job fires and marks the order as cancelled.

---

## 3. Payment Gateway Routing
LearnHub utilizes two primary concurrent payment gateways. Instead of relying on instant synchronous verification (which can fail due to network drops), it relies fully on asynchronous Webhook validation to grant access, ensuring 100% transactional accuracy.

### A. Stripe Gateway (International)
- **Checkout Sessions:** Invokes `createCheckoutSession` to generate hosted Stripe payment UIs. Passes `{ orderId, orderCode }` via `metadata` arrays.
- **Webhook Handlers:** Listens to `checkout.session.completed`. Upon hearing the event, it extracts the metadata ID, validates the raw Buffer Payload via `constructWebhookEvent`, and executes `completeOrder()`.

### B. SePay Gateway (Domestic / Bank Transfer)
- **Content Parsing:** Webhooks from SePay listen to `TransferType.IN` transaction strings. 
- **Regex Extraction:** Matches `/ORD\d+/i` against the bank transfer memo (content message) to detect the associated `orderCode`. 
- **Amount Validation:** Cross-references the `transferAmount` with the exact `order.totalAmount` via `Math.abs(orderTotal - paidAmount) < 0.01` to safeguard against partial payments or spoofing before unlocking content.

---

## 4. Single Source of Access Truth
The database architecture employs an elegant "Single Source of Truth". There is no secondary `UserCourse` junction table to track what course a user owns. 
Instead, ownership is inherently determined by the existence of an `OrderItem` tied to an `Order` where `status === 'COMPLETED'`. When a payment webhook succeeds, the `order.status` flips to `COMPLETED`, granting the student immediate access system-wide.

### Post-Payment Side Effects
1. Changes `Order.status` to `COMPLETED`.
2. Increments `Course.sold` integer.
3. Automatically queues and dispatches customized email notifications (either `queueMembershipActivatedEmail` or `queuePaymentSuccessEmail`) equipped with PDF invoices via `EmailQueueService`.
4. Sends real-time socket alerts to Admin via `notificationService.notifyPaymentSuccess`.
