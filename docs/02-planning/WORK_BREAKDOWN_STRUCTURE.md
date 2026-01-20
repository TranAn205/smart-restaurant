# Work Breakdown Structure (WBS) - Smart Restaurant

## Team Members

| Tên | MSSV | Role |
|-----|------|------|
| Nguyễn Lê Thế Vinh | 23120190 | Team Lead, FE Customer |
| Trần Thanh An | 23120017 | Backend, Database |
| Nguyễn Thị Ánh Ngọc | 23120061 | FE Admin, QA |

---

## Project Summary

```
Smart Restaurant System (100%) ✅ 99% Complete
├── 1. Guest Ordering (30%) ✅ 100%
├── 2. Admin Panel (25%) ✅ 100%
├── 3. Staff Operations (25%) ✅ 100%
├── 4. Infrastructure (15%) ✅ 100%
└── 5. Documentation & Delivery (5%) 🔄 80%
```

---

## Detailed WBS

### 1. Guest Ordering (30%) - Nguyễn Lê Thế Vinh Primary ✅

| ID        | Task                    | Story Points | Owner | Sprint | Status |
| --------- | ----------------------- | ------------ | ----- | ------ | ------ |
| 1.1       | QR Scan & Table Session | 3            | Trần Thanh An | 1 | ✅ Done |
| 1.2       | Menu Display Page       | 5            | Nguyễn Lê Thế Vinh | 1 | ✅ Done |
| 1.3       | Menu Item Filter/Search | 3            | Nguyễn Lê Thế Vinh | 1 | ✅ Done |
| 1.4       | Menu Item Detail        | 3            | Nguyễn Lê Thế Vinh | 1 | ✅ Done |
| 1.5       | Cart Context & Drawer   | 5            | Nguyễn Lê Thế Vinh | 1 | ✅ Done |
| 1.6       | Cart Item Management    | 3            | Nguyễn Lê Thế Vinh | 1 | ✅ Done |
| 1.7       | Checkout Flow           | 5            | Nguyễn Lê Thế Vinh | 2 | ✅ Done |
| 1.8       | Order Status Page       | 5            | Nguyễn Lê Thế Vinh | 2 | ✅ Done |
| 1.9       | Add More Items to Order | 3            | Nguyễn Lê Thế Vinh | 2 | ✅ Done |
| 1.10      | Request Bill            | 2            | Nguyễn Lê Thế Vinh | 4 | ✅ Done |
| 1.11      | Payment Page            | 5            | Nguyễn Lê Thế Vinh | 4 | ✅ Done |
| **Total** |                         | **42 SP**    |       |        | ✅ 100% |

---

### 2. Admin Panel (25%) - Nguyễn Thị Ánh Ngọc Primary ✅

| ID        | Task                     | Story Points | Owner | Sprint | Status |
| --------- | ------------------------ | ------------ | ----- | ------ | ------ |
| 2.1       | Admin Login Page         | 3            | Nguyễn Thị Ánh Ngọc | 1 | ✅ Done |
| 2.2       | Admin Dashboard          | 5            | Nguyễn Thị Ánh Ngọc | 2 | ✅ Done |
| 2.3       | Menu Categories CRUD     | 5            | Nguyễn Thị Ánh Ngọc | 2 | ✅ Done |
| 2.4       | Menu Items CRUD          | 5            | Nguyễn Thị Ánh Ngọc | 2 | ✅ Done |
| 2.5       | Menu Modifiers           | 3            | Nguyễn Thị Ánh Ngọc | 2 | ✅ Done |
| 2.6       | Table Management         | 3            | Nguyễn Thị Ánh Ngọc | 2 | ✅ Done |
| 2.7       | QR Code Generation       | 3            | Trần Thanh An | 2 | ✅ Done |
| 2.8       | Staff Account Management | 3            | Nguyễn Thị Ánh Ngọc | 3 | ✅ Done |
| 2.9       | Reports - Daily Revenue  | 5            | Nguyễn Thị Ánh Ngọc | 4 | ✅ Done |
| 2.10      | Reports - Top Items      | 3            | Nguyễn Thị Ánh Ngọc | 4 | ✅ Done |
| **Total** |                          | **38 SP**    |       |        | ✅ 100% |

---

### 3. Staff Operations (25%) - Trần Thanh An + Nguyễn Thị Ánh Ngọc ✅

| ID        | Task                  | Story Points | Owner | Sprint | Status |
| --------- | --------------------- | ------------ | ----- | ------ | ------ |
| 3.1       | Waiter Login          | 2            | Nguyễn Thị Ánh Ngọc | 2 | ✅ Done |
| 3.2       | Waiter Orders List    | 5            | Nguyễn Thị Ánh Ngọc | 3 | ✅ Done |
| 3.3       | Accept/Reject Orders  | 3            | Nguyễn Thị Ánh Ngọc | 3 | ✅ Done |
| 3.4       | Mark as Served        | 2            | Nguyễn Thị Ánh Ngọc | 3 | ✅ Done |
| 3.5       | Kitchen Staff Login   | 2            | Nguyễn Thị Ánh Ngọc | 3 | ✅ Done |
| 3.6       | KDS Page Layout       | 5            | Nguyễn Thị Ánh Ngọc | 3 | ✅ Done |
| 3.7       | KDS Real-time Updates | 5            | Trần Thanh An | 3 | ✅ Done |
| 3.8       | KDS Timer & Alerts    | 3            | Nguyễn Thị Ánh Ngọc | 3 | ✅ Done |
| 3.9       | Sound Notifications   | 2            | Nguyễn Thị Ánh Ngọc | 3 | ✅ Done |
| **Total** |                       | **29 SP**    |       |        | ✅ 100% |

---

### 4. Infrastructure (15%) - Trần Thanh An Primary ✅

| ID        | Task            | Story Points | Owner | Sprint | Status |
| --------- | --------------- | ------------ | ----- | ------ | ------ |
| 4.1       | Database Design | 5            | Trần Thanh An | 0 | ✅ Done |
| 4.2       | Auth APIs (JWT) | 5            | Trần Thanh An | 1 | ✅ Done |
| 4.3       | Menu APIs       | 5            | Trần Thanh An | 1 | ✅ Done |
| 4.4       | Order APIs      | 5            | Trần Thanh An | 1 | ✅ Done |
| 4.5       | Socket.IO Setup | 5            | Trần Thanh An | 1 | ✅ Done |
| 4.6       | Kitchen APIs    | 3            | Trần Thanh An | 3 | ✅ Done |
| 4.7       | Payment APIs    | 5            | Trần Thanh An | 4 | ✅ Done |
| 4.8       | Reports APIs    | 3            | Trần Thanh An | 4 | ✅ Done |
| 4.9       | Deployment      | 5            | Trần Thanh An | 5 | ✅ Done |
| **Total** |                 | **41 SP**    |       |        | ✅ 100% |

---

### 5. Documentation & Delivery (5%) - Nguyễn Lê Thế Vinh Lead 🔄

| ID        | Task                 | Story Points | Owner | Sprint | Status |
| --------- | -------------------- | ------------ | ----- | ------ | ------ |
| 5.1       | API Documentation    | 3            | Trần Thanh An | 4 | ✅ Done |
| 5.2       | User Guide           | 2            | Nguyễn Lê Thế Vinh | 5 | ✅ Done |
| 5.3       | Self-Assessment      | 2            | All | 5 | ✅ Done |
| 5.4       | Demo Script          | 2            | Nguyễn Lê Thế Vinh | 5 | ✅ Done |
| 5.5       | Demo Video Recording | 3            | Nguyễn Lê Thế Vinh | 5 | ⏳ Pending |
| **Total** |                      | **12 SP**    |       |        | 🔄 80% |

---

## Summary by Owner

| Owner                 | Total Story Points | Percentage | Status |
| --------------------- | ------------------ | ---------- | ------ |
| Nguyễn Lê Thế Vinh    | ~52 SP             | 32%        | ✅ Done |
| Trần Thanh An         | ~54 SP             | 33%        | ✅ Done |
| Nguyễn Thị Ánh Ngọc   | ~56 SP             | 35%        | ✅ Done |
| **Total**             | **162 SP**         | **100%**   | **99%** |

---

## Summary by Sprint

| Sprint   | Days  | Story Points | Focus                    | Status |
| -------- | ----- | ------------ | ------------------------ | ------ |
| Sprint 0 | 1-2   | 15 SP        | Setup, Database          | ✅ Done |
| Sprint 1 | 3-7   | 40 SP        | Guest Menu, Cart, Orders | ✅ Done |
| Sprint 2 | 8-12  | 35 SP        | Admin, Checkout          | ✅ Done |
| Sprint 3 | 13-16 | 30 SP        | KDS, Waiter              | ✅ Done |
| Sprint 4 | 17-18 | 25 SP        | Payment, Reports         | ✅ Done |
| Sprint 5 | 19-20 | 17 SP        | Deploy, Demo             | 🔄 88% |

---

_Document Version: 1.2 | Last Updated: 20/01/2026_
