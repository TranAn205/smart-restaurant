# Final project Self-assessment report

Team: 23120017-23120061-23120190

GitHub repo URL: https://github.com/TranAn205/smart-restaurant

# **TEAM INFORMATION**

| Student ID | Full name | Git account | Contribution | Contribution percentage (100% total) | Expected total points | Final total points |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 23120017 | Trần Thanh An | Gaaus56 | Backend, Database | 33% | 10 |  |
| 23120061 | Nguyễn Thị Ánh Ngọc | angquoc | Frontend, UI/UX | 33% | 10 |  |
| 23120190 | Nguyễn Lê Thế Vinh | Zinthw | Leader, Fullstack Development | 34% | 10 |  |

# **FEATURE LIST**

**Project:** Smart Restaurant - QR Menu Ordering System

\*SE: Self-evaluation

\*TR: Teacher review

| ID | Features | Grade |  |  | Notes |
| ----- | :---- | ----- | :---- | :---- | :---- |
|  |  | **Point** | **SE\*** | **TR\*** |  |
| **1** | **Overall requirements** |  |  |  |  |
|  | User-centered design | \-5 | 0 |  | Built with user experience in mind, not just feature list. Focus on solving real restaurant problems: seamless QR ordering, efficient waiter workflow, real-time kitchen coordination, and convenient payment options |
|  | Database design | \-1 | 0 |  | Database with tables: users, restaurants, menus, menu_items, categories, modifiers, tables, orders, order_items, payments |
|  | Database mock data | \-1 | 0 |  | Sample restaurants, menu items, categories, tables, and test orders |
|  | Website layout | \-2 | 0 |  | Two layouts: Customer mobile ordering interface and Admin dashboard |
|  | Website architect | \-3 | 0 |  | Based on MVC architecture. Clear separation of concerns with controllers, services, repositories. Client-side validation, Input validation, Business rule validation |
|  | Website stability and compatibility | \-2 | 0 |  | Mobile-first responsive design, tested on Chrome and Safari |
|  | Document | \-1 | 0 |  | Clear documentation for developers and users: setup guide, API endpoints, database design, system architecture, user guide |
|  | Demo video | \-5 | 0 |  | Video demonstrating all features: restaurant signup, menu management, QR ordering, payment, KDS |
|  | Publish to public hosts | \-1 | 0 |  | Deployed to a public hosting service with accessible URL |
|  | Development progress is recorded in Github | \-7 | 0 |  | Git history with meaningful commits, branches for features, pull requests |
| **2** | **Guest features (Customer Ordering)** |  |  |  |  |
|  | Home page (Menu page) |-0.25 | 0 |  | Restaurant menu page loaded via QR code scan with categories and items |
|  | View list of menu items | \-0.25 | 0 |  | Display menu items with images, prices, descriptions |
|  | Filter menu items by |  |  |  | A combination of the criteria |
|  | › Item name | \-0.25 | 0 |  | Search menu items by name |
|  | › Category | \-0.25 | 0 |  | Filter by food categories (Appetizers, Main Dishes, Drinks, Desserts) |
|  | Sort menu items by popularity | \-0.25 | 0 |  | Sort by most ordered items |
|  | › Chef recommendation | \-0.25 | 0 |  | Filter/highlight items marked as chef's recommendations |
|  | Menu item paging | \-0.75 | 0 |  | Pagination for large menus with infinite scroll. URL updated on search/filter/paging |
|  | View menu item details | \-0.25 | 0 |  | Item detail page with full description, modifiers, allergen info |
|  | View menu item status | \-0.25 | 0 |  | Display item availability status (Available, Unavailable, Sold out) |
|  | Show related menu items | \-0.25 | 0 |  | Suggest items from same category or popular pairings |
|  | View list of item reviews | \-0.5 | 0 |  | Customer reviews for menu items with pagination |
|  | Add a new item review | \-0.25 | 0 |  | Logged-in customers can review items they ordered |
|  | Shopping cart (Order Cart) |  |  |  |  |
|  | › Add a menu item to the Cart | \-0.25 | 0 |  | Add items with quantity selection |
|  | › View and update items in the Cart | \-0.5 | 0 |  | Cart summary with items, quantities, modifiers, prices. Update quantity with auto-update totals |
|  | Ordering and payment (Dine-in) |  |  |  |  |
|  | › Bind the shopping cart to the table session | \-0.25 | 0 |  | Cart persists for table session |
|  | › Input order details (notes, special requests) | \-0.25 | 0 |  | Guest name, special instructions field |
|  | › Add items to current order | \-0.25 | 0 |  | Customers can add more items to their unpaid order (single order per table session) |
|  | › View order status | \-0.25 | 0 |  | Guest can track order status (Received → Preparing → Ready) |
|  | › View order details | \-0.25 | 0 |  | Order confirmation with items, total, table number |
|  | › Request bill | \-0.25 | 0 |  | Customer requests bill when ready to pay |
|  | › Process payment after meal | \-0.25 | -0.25 |  | Stripe payment processing after dining |
| **3** | **Authentication and authorization** |  |  |  |  |
|  | Use a popular authentication library | \-1 | 0 |  | Passport.js with JWT strategy |
|  | Registration (Customer Signup) | \-0.5 | 0 |  | Customer registration with email/password. Real-time email availability check |
|  | Verify user input: password complexity, full name | \-0.25 | 0 |  | Password rules, required fields validation |
|  | Account activation by email | \-0.25 | 0 |  | Email verification link sent on signup |
|  | Social Sign-up/Sign-In | \-0.25 | 0 |  | Google OAuth integration |
|  | Login to the website | \-0.25 | 0 |  | JWT-based authentication for admin/staff |
|  | Authorize website features | \-0.25 | 0 |  | Role-based access control (Admin, Waiter, Kitchen Staff, Customer) |
|  | Forgot password by email | \-0.25 | 0 |  | Password reset via email link |
| **4** | **Features for logged-in users (Customers)** |  |  |  |  |
|  | Update user profile | \-0.25 | 0 |  | Customer can update name, preferences |
|  | Verify user input | \-0.25 | 0 |  | Input validation on profile updates |
|  | Update the user's avatar | \-0.25 | 0 |  | Profile photo upload |
|  | Update password | \-0.25 | 0 |  | Change password with old password verification |
|  | Order history and tracking |  |  |  |  |
|  | › View order history | \-0.25 | 0 |  | List of past orders linked to user account |
|  | › View item processing status | \-0.25 | 0 |  | Track individual item status within an order (Queued, Cooking, Ready) |
|  | › Real-time Order Updates | 0.5 | 0.5 |  | WebSocket-based live order status updates for customers |
| **5** | **Administration features (Restaurant Admin)** |  |  |  |  |
|  | Create Admin accounts | \-0.25 | 0 |  | Admin creates additional Admin accounts |
|  | Manage Admin accounts | \-0.25 | 0 |  | View, edit, deactivate Admin accounts |
|  | Update admin profile | \-0.25 | 0 |  | Restaurant admin profile management |
|  | Create Waiter accounts | \-0.25 | 0 |  | Admin creates accounts for waiters |
|  | Create Kitchen Staff accounts | \-0.25 | 0 |  | Admin creates accounts for kitchen staff |
|  | Manage menu categories | \-0.25 | 0 |  | Create, edit, delete food categories |
|  | View menu item list | \-0.5 | 0 |  | List all menu items with filters and pagination |
|  | Filter menu items by name, category | \-0.25 | 0 |  | Search and filter menu items |
|  | Sort menu items by creation time, price, popularity | \-0.25 | 0 |  | Sortable menu item list |
|  | Create a new menu item | \-0.25 | 0 |  | Add item with name, price, description, category, prep time |
|  | Upload multiple menu item photos | \-0.5 | 0 |  | Multi-image upload for menu items |
|  | Add menu item to category with modifiers | \-0.25 | 0 |  | Assign categories and create modifier groups (Size, Extras) |
|  | Menu Item Modifiers | 0.5 | 0.5 |  | Modifier groups (Size, Extras) with price adjustments |
|  | Specify menu item status | \-0.25 | 0 |  | Available, Unavailable, Sold out |
|  | Verify user input | \-0.25 | 0 |  | Input validation for menu items |
|  | Update a menu item | \-0.25 | 0 |  | Edit existing menu items |
|  | Add, remove menu item photos | \-0.25 | 0 |  | Manage item images |
|  | Change menu item category, modifiers | \-0.25 | 0 |  | Update item categorization |
|  | Update menu item status | \-0.25 | 0 |  | Toggle availability |
|  | Verify user input | \-0.25 | 0 |  | Validation on updates |
|  | Customer orders (Order Management) |  |  |  |  |
|  | › View list of orders sorted by creation time | \-0.25 | 0 |  | Order list in KDS sorted by time |
|  | › Filter orders by status | \-0.25 | 0 |  | Filter: Received, Preparing, Ready, Completed |
|  | › View order details | \-0.25 | 0 |  | Full order details with items, modifiers, notes |
|  | › Update order status | \-0.25 | 0 |  | Progress order through states: Received → Preparing → Ready → Completed |
|  | › Kitchen Display System (KDS) | -0.5 | 0 |  | Real-time order display for kitchen staff with sound notifications |
|  | › Order Timer and Alerts | -0.25 | 0 |  | Highlight orders exceeding item's configured prep time |
|  | Table Management |  |  |  |  |
|  | › Create, edit, deactivate tables | -0.5 | 0 |  | Create, edit, deactivate tables with capacity and location |
|  | › QR Code Generation | -0.5 | 0 |  | Generate unique QR codes per table with signed tokens |
|  | › QR Code Download/Print | -0.25 | 0 |  | Download QR as PNG/PDF for printing |
|  | › QR Code Regeneration | -0.25 | 0 |  | Regenerate QR and invalidate old codes |
|  | Reports |  |  |  |  |
|  | › View revenue report in time range | \-0.25 | 0 |  | Daily, weekly, monthly revenue reports |
|  | › View top revenue by menu item in time range | \-0.25 | 0 |  | Best-selling items report |
|  | › Show interactive chart in reports | \-0.25 | 0 |  | Chart.js/Recharts for analytics dashboard (orders/day, peak hours, popular items) |
| **7** | **Waiter features** |  |  |  |  |
|  | View pending orders | \-0.25 | 0 |  | List of new orders waiting for waiter acceptance |
|  | Accept/Reject order items | \-0.25 | 0 |  | Waiter can accept or reject individual order items |
|  | Send orders to kitchen | \-0.25 | 0 |  | Forward accepted orders to Kitchen Display System |
|  | View assigned tables | \-0.25 | 0 |  | See tables assigned to the waiter |
|  | Mark orders as served | \-0.25 | 0 |  | Update order status when food is delivered to table |
|  | Bill Management |  |  |  |  |
|  | › Create bill for table | \-0.25 | 0 |  | Generate bill with all order items, subtotal, tax, and total |
|  | › Print bill | \-0.25 | 0 |  | Print bill to thermal printer or download as PDF |
|  | › Apply discounts | \-0.25 | 0 |  | Apply percentage or fixed amount discounts to bill |
|  | › Process payment | \-0.25 | 0 |  | Mark bill as paid (cash, card, or e-wallet) |
| **8** | **Advanced features** |  |  |  |  |
|  | Payment system integration | 0.5 | 0 |  | Payment gateway integration (ZaloPay, MoMo, VNPay, Stripe, etc.) - at least 1 required |
|  | Fuzzy search | 0.25 | 0.25 |  | Fuzzy matching for menu item search with typo tolerance |
|  | Use memory cache to boost performance | 0.25 | 0.25 | | Redis for menu caching and session management |
|  | Analyze and track user actions | 0.25 | 0 |  | Google Analytics for QR scan tracking, order conversion metrics |
|  | Dockerize your project | 0.25 | 0.25 |  | Docker containers for backend, frontend, database |
|  | CI/CD | 0.25 | 0 |  | GitHub Actions for automated testing and deployment |
|  | Monitoring and logging | 0.25 | 0.25 |  | Centralized application logs, metrics, dashboards, and alerting (e.g., ELK/EFK, Prometheus/Grafana) |
|  | BI integration | 0.25 | 0 |  | Connect operational data to BI tools for reporting and dashboards (e.g., Power BI, Tableau, Metabase) |
|  | Advanced authorization (RBAC) | 0.25 | 0.25 |  | Fine-grained role/permission management for Admin/Chef/Waiter and other staff roles |
|  | WebSocket real-time updates | 0.5 | 0.5 |  | Socket.IO for real-time features: KDS order notifications, customer order status tracking, waiter new order alerts, kitchen ready notifications, table status updates |
|  | Multi-tenant support | 0.5 | 0 |  | Multiple restaurants (tenants) with strict data isolation; tenant-scoped RBAC and configuration |
|  | Multilingual support | 0.25 | 0.25 |  | i18n for English/Vietnamese language selection |

# **GIT HISTORY**

## **Contributors**

| Avatar | Username | Commits | Additions | Deletions |
| :---- | :---- | :---- | :---- | :---- |
| <img src="https://github.com/TranAn205.png" width="50"> | Tran An | 17 | 7,576 | 21 |
| <img src="https://github.com/angquoc.png" width="50"> | angquoc | 20 | 15,549 | 661 |
| <img src="https://github.com/Zinthw.png" width="50"> | Zinthw | 41 | 10,973 | 840 |

## **Commits** 

| Date | Author | Commit Message | Hash |
| :---- | :---- | :---- | :---- |
| 2026-01-03 | Gaaus56 | chore: Initialize project structure | 380c3cb |
| 2026-01-03 | Gaaus56 | feat(backend): Add Express server skeleton | e6a6ac6 |
| 2026-01-04 | Gaaus56 | feat(db): Add database schema and migrations | f249b91 |
| 2026-01-04 | Gaaus56 | feat(frontend): Initialize NextJS project | 2ccf8fa |
| 2026-01-05 | Gaaus56 | feat(backend): Add authentication routes and controller | d754a48 |
| 2026-01-06 | Gaaus56 | feat(backend): Add menu CRUD API with controllers | e3e105e |
| 2026-01-07 | angquoc | feat(frontend): Add UI component library | 3c06e98 |
| 2026-01-07 | Zinthw | feat(frontend): Add guest menu page with categories | b8582ac |
| 2026-01-08 | Zinthw | feat(frontend): Add cart context and drawer | 28284c0 |
| 2026-01-08 | Gaaus56 | feat(backend): Add order creation and tracking API | 77f3e06 |
| 2026-01-09 | Zinthw | feat(frontend): Add checkout and order submission | 5362961 |
| 2026-01-09 | Zinthw | feat(frontend): Add real-time order status tracking | 98fb78a |
| 2026-01-09 | angquoc | feat(frontend): Add guest login and registration | 0017393 |
| 2026-01-10 | angquoc | feat(frontend): Add admin login page | c8c95d9 |
| 2026-01-11 | angquoc | feat(frontend): Add admin dashboard with stats | 16476b9 |
| 2026-01-11 | angquoc | feat(frontend): Add menu management CRUD | f4606a9 |
| 2026-01-12 | Gaaus56 | feat(backend): Add table management and QR generation API | ad15f8e |
| 2026-01-12 | angquoc | feat(frontend): Add table management with QR codes | 71cd9fe |
| 2026-01-13 | Gaaus56 | feat(backend): Add kitchen and waiter API with controllers | 3818452 |
| 2026-01-13 | angquoc | feat(frontend): Add Kitchen Display System with real-time | 118009a |
| 2026-01-14 | angquoc | feat(frontend): Add waiter order management | 99838cb |
| 2026-01-15 | Gaaus56 | feat(backend): Add payment and billing API | ded130e |
| 2026-01-15 | Zinthw | feat(frontend): Add payment pages | dace9d1 |
| 2026-01-16 | Gaaus56 | feat(backend): Add revenue and analytics API | c0aa3ca |
| 2026-01-16 | Gaaus56 | feat(backend): Add menu item reviews API | 4845746 |
| 2026-01-16 | Zinthw | feat(frontend): Add review and profile pages | 5b20bd1 |
| 2026-01-16 | Gaaus56 | feat(backend): Add user and superadmin management | 79f4ca4 |
| 2026-01-16 | Zinthw | feat(admin): Add Orders, Staff pages, Dashboard charts, Menu sort | 344f7a6 |
| 2026-01-16 | Zinthw | feat(reports): Add PDF and Excel export functionality | 4729ead |
| 2026-01-16 | Zinthw | fix(waiter): Improve UI - group ready items by table, add sound notification, simplify header | bfd6034 |
| 2026-01-16 | angquoc | feat(backend): implement payment, order and review logic | 65da418 |
| 2026-01-16 | Zinthw | fix(admin): Fix QR code display - use API_BASE_URL, add auto-generate when opening dialog | 6d688d3 |
| 2026-01-16 | Zinthw | fix(admin): Fix order NaN, staff toggle, add chart, print invoice | 1f7d19a |
| 2026-01-17 | Zinthw | fix(admin): Fix sidebar sticky positioning and add chart to PDF export | 9ed745c |
| 2026-01-17 | Zinthw | feat(reviews): Add review stats to menu and my-reviews page | 58064c8 |
| 2026-01-17 | Zinthw | fix: kitchen order flow - add socket.io real-time updates and fix status column | 2453980 |
| 2026-01-17 | Zinthw | feat: add sort by popularity and chef recommendation filter | 4c866d9 |
| 2026-01-17 | Zinthw | feat: Add bill printing feature with Vietnamese font support | f1ebf8d |
| 2026-01-17 | angquoc | feat: add reward points API and fix missing dish status for waiters | 7dbbe95 |
| 2026-01-17 | Zinthw | feat: Add VAT (10%) breakdown to guest order detail page | 295fac7 |
| 2026-01-17 | Zinthw | feat: implement VAT display, infinite scroll, role guard and i18n support | f0ecafb |

---

# **PROJECT SUMMARY**

## System Overview
**Smart Restaurant** is a QR-based menu ordering system for **dine-in service** that enables restaurants to:
- Manage digital menus with categories, items, and modifiers
- Generate unique QR codes for each table
- Allow customers to scan QR, browse menu, and place orders from their phones
- Customers can add items to their current order during their visit (single order per table session)
- Process payments after the meal via payment gateway integration (ZaloPay, MoMo, VNPay, Stripe, etc.) - pay-after-meal model
- Track orders in real-time via Kitchen Display System (KDS)
- View analytics and performance reports

**Note:** This is a single-restaurant system. Multi-tenant support is not included.

## Technology Stack
- **Architecture:** Single Page Application (SPA)
- **Frontend:** ReactJS / NextJS
- **Backend:** NodeJS with Express/similar framework
- **Database:** SQL or NoSQL database
- **Authentication:** Passport.js with JWT
- **Payment:** Payment Gateway (ZaloPay, MoMo, VNPay, Stripe, etc.)
- **Real-time:** Socket.IO / WebSocket
- **Caching:** Redis (optional)
- **Hosting:** Public hosting service

## Key User Flows
1. **Restaurant Setup:** Admin account creation → Admin login → Menu Creation → Table Setup → QR Generation
2. **Customer Registration:** Sign up → Email Verification → Login → Access order history
3. **Customer Ordering (Dine-in):** Scan QR → View Menu → Add to Cart → Submit Items → Track Order → Add More Items → Request Bill → Payment
4. **Waiter Order Acceptance:** Customer Places Order → Waiter Receives Notification → Waiter Reviews → Accept/Reject → Send to Kitchen
5. **Order Processing (Kitchen):** Waiter Accepts Order → Kitchen Receives → Preparing → Ready → Waiter Serves → Completed

---

