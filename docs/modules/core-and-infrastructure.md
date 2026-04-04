# System Core & Analytics Dashboard Module Documentation

## Overview
The **System Core** bridges the gap between infrastructure services and actionable business intelligence. It powers background workflows, ensures fast delivery of cross-client data, and crunches numbers for administrative overview.

This domain consists of four utility/infrastructure modules:
- `StatsModule` (Admin Dashboard Analytics)
- `NotificationModule` (WebSocket Notifications)
- `EmailModule` (BullMQ Background Jobs)
- `SearchModule` (Global Querying)

---

## 1. Business Intelligence (StatsModule)
The `StatsService` powers the entire `Admin Dashboard` layer by structuring data specifically for visual frontend representations (like charts and delta metrics).

### Key Features
- **Delta Percentage Calculation**: Automatically compares data blocks from the `startOfCurrentMonth` vs `startOfLastMonth` to derive `changePercentage` for `totalUsers`, `activeCourses`, and `totalRevenue`.
- **Monthly Revenue Mapping**: Constructs a continuous 12-month array (`monthlyMap`) representing `$sum.totalAmount` for line charts, ensuring there are no null gaps for months with zero sales.

---

## 2. Infrastructure Resilience (Email Module & BullMQ)
The platform isolates slow networking tasks (SMTP Email protocols) to avoid hanging HTTP requests during checkout.
- **Fail-Safe Job Queuing**: Leverages `@nestjs/bullmq`. If an email fails to dispatch (e.g., SMTP down), the configurations dictate `attempts: 3` with `backoff: { type: 'exponential', delay: 5000 }`.
- **Job Decoupling**: Offloading Order Confirmations, OTPs, and Membership Activations to dedicated Redis workers guarantees exactly-once delivery and shields the main application's event loop.

---

## 3. Real-Time Push Engine (NotificationGateway)
To enable real-time UI updates (e.g., "Payment completed successfully", "You received a new comment"), a robust Websocket is operated via Socket.io.

### Authed-Room Architecture
Instead of broadcasting wildly to all sockets, the gateway uses a specialized `WsAuthMiddleware`. 
When a client connects, the gateway maps them into three distinct types of isolated Rooms based on their JWT token signature:
1. **Targeted Delivery**: `client.join("user:${userId}")` enables precise DM-like notifications (e.g., "Your payment was received!").
2. **Role Delivery**: `client.join("role:Admin")` or `client.join("role:Super Admin")` enables mass-system alerts (e.g., "New Course Review Needs Approval!").
3. **Global Broadcast**: `client.join('authenticated')` handles generic system-wide pushes.
