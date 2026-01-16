# Sprint Planning - Smart Restaurant

## Team Members

| Tên | MSSV | Role |
|-----|------|------|
| Nguyễn Lê Thế Vinh | 23120190 | Team Lead, FE Customer |
| Trần Thanh An | 23120017 | Backend, Database |
| Nguyễn Thị Ánh Ngọc | 23120061 | FE Admin, QA |

---

## Sprint Overview

| Sprint   | Days  | Dates    | Goal                  | Status |
| -------- | ----- | -------- | --------------------- | ------ |
| Sprint 0 | 1-2   | 03-04/01 | Setup & Foundation    | ✅ Done |
| Sprint 1 | 3-7   | 05-09/01 | Guest Ordering MVP    | ✅ Done |
| Sprint 2 | 8-12  | 10-14/01 | KDS & Waiter Complete | ✅ Done |
| Sprint 3 | 13-16 | 15-18/01 | Payment & Reports     | ✅ Done |
| Sprint 4 | 17-18 | 19-20/01 | Testing & Bug Fix     | ✅ Done |
| Sprint 5 | 19-20 | 21-22/01 | Deploy & Demo         | 🔄 In Progress |

---

## Sprint 0: Setup & Foundation (Day 1-2) ✅

**Goal:** Cả team hiểu scope, skeleton FE/BE chạy được

### Nguyễn Lê Thế Vinh (Team Lead / FE Customer)

- [x] Đọc kỹ tất cả docs: PROJECT_DESCRIPTION, SELF_ASSESSMENT
- [x] Tóm tắt scope, xác nhận features với team
- [x] Review UI Mockups, xác định components cần build

### Trần Thanh An (Backend / Infra)

- [x] Thiết kế ERD final
- [x] Setup backend skeleton
- [x] Setup database + migration scripts
- [x] Tạo .env.example

### Nguyễn Thị Ánh Ngọc (FE Admin / QA)

- [x] Setup frontend skeleton
- [x] Test existing pages (Menu, Admin)
- [x] Identify bugs cần fix

**Sprint 0 Deliverables:**

- ✅ Team aligned on scope
- ✅ Backend + Frontend running locally
- ✅ Database schema finalized

---

## Sprint 1: Guest Ordering MVP (Day 3-7) ✅

**Goal:** Khách scan QR → xem menu → chọn món → gửi order → xem status

### Nguyễn Lê Thế Vinh

| Day | Task                    | Status |
| --- | ----------------------- | ------ |
| 3   | CartContext setup       | ✅ Done |
| 3   | CartDrawer component    | ✅ Done |
| 4   | Add to cart from Menu   | ✅ Done |
| 4   | Cart item edit/remove   | ✅ Done |
| 5   | Checkout page           | ✅ Done |
| 6   | Order Status page       | ✅ Done |
| 7   | Socket hook for updates | ✅ Done |

### Trần Thanh An

| Day | Task                          | Status |
| --- | ----------------------------- | ------ |
| 3   | Socket.IO server setup        | ✅ Done |
| 3   | Order events (create, update) | ✅ Done |
| 4   | Socket emit on order create   | ✅ Done |
| 5   | Socket rooms per table        | ✅ Done |
| 6   | Broadcast status changes      | ✅ Done |
| 7   | Test full flow                | ✅ Done |

### Nguyễn Thị Ánh Ngọc

| Day | Task                 | Status |
| --- | -------------------- | ------ |
| 3   | Review Guest Menu UI | ✅ Done |
| 3   | Fix UI bugs          | ✅ Done |
| 4   | Shared components    | ✅ Done |
| 5   | Test Guest flow      | ✅ Done |
| 6   | Write test cases     | ✅ Done |
| 7   | Bug fixes            | ✅ Done |

**Sprint 1 Deliverables:**

- ✅ Guest có thể add món vào cart
- ✅ Guest có thể submit order
- ✅ Guest có thể xem order status real-time

---

## Sprint 2: KDS & Waiter Complete (Day 8-12) ✅

**Goal:** Kitchen và Waiter có thể xử lý order

### Nguyễn Lê Thế Vinh

| Day   | Task                   | Status |
| ----- | ---------------------- | ------ |
| 8-9   | Polish Cart UX         | ✅ Done |
| 10    | Error handling         | ✅ Done |
| 11-12 | Support testing + docs | ✅ Done |

### Trần Thanh An

| Day | Task                      | Status |
| --- | ------------------------- | ------ |
| 8   | Kitchen API: GET orders   | ✅ Done |
| 9   | Kitchen API: PATCH status | ✅ Done |
| 10  | Socket for KDS            | ✅ Done |
| 11  | Timer logic               | ✅ Done |
| 12  | Waiter notifications      | ✅ Done |

### Nguyễn Thị Ánh Ngọc

| Day | Task                 | Status |
| --- | -------------------- | ------ |
| 8   | KDS page layout      | ✅ Done |
| 9   | Order cards UI       | ✅ Done |
| 10  | KDS real-time update | ✅ Done |
| 11  | Timer display        | ✅ Done |
| 12  | Sound notifications  | ✅ Done |

**Sprint 2 Deliverables:**

- ✅ Kitchen thấy order mới real-time
- ✅ Kitchen update status (preparing → ready)
- ✅ Waiter nhận notification

---

## Sprint 3: Payment & Reports (Day 13-16) ✅

**Goal:** Thanh toán và báo cáo cơ bản

### Nguyễn Lê Thế Vinh

| Day | Task              | Status |
| --- | ----------------- | ------ |
| 13  | Payment page UI   | ✅ Done |
| 14  | Bill summary      | ✅ Done |
| 15  | Receipt display   | ✅ Done |
| 16  | Payment flow test | ✅ Done |

### Trần Thanh An

| Day | Task                   | Status |
| --- | ---------------------- | ------ |
| 13  | Bill API               | ✅ Done |
| 14  | Payment API            | ✅ Done |
| 15  | Reports API: daily     | ✅ Done |
| 16  | Reports API: top-items | ✅ Done |

### Nguyễn Thị Ánh Ngọc

| Day | Task                | Status |
| --- | ------------------- | ------ |
| 13  | Reports page layout | ✅ Done |
| 14  | KPI cards           | ✅ Done |
| 15  | Revenue chart       | ✅ Done |
| 16  | Top items table     | ✅ Done |

**Sprint 3 Deliverables:**

- ✅ Guest xem bill và thanh toán
- ✅ Admin xem daily revenue
- ✅ Admin xem top-selling items

---

## Sprint 4: Testing & Bug Fix (Day 17-18) ✅

**Goal:** Stabilize cho demo

### All Team

| Day | Task                  | Status |
| --- | --------------------- | ------ |
| 17  | E2E test all flows    | ✅ Done |
| 17  | Mobile responsiveness | ✅ Done |
| 18  | Security review       | ✅ Done |
| 18  | Bug fixing            | ✅ Done |
| 18  | **CODE FREEZE 6PM**   | ✅ Done |

**Sprint 4 Deliverables:**

- ✅ All major bugs fixed
- ✅ Demo-ready state

---

## Sprint 5: Deploy & Demo (Day 19-20) 🔄

**Goal:** Production + Demo video

### Nguyễn Lê Thế Vinh

| Day | Task              | Status |
| --- | ----------------- | ------ |
| 19  | Demo script       | ✅ Done |
| 19  | Rehearsal         | ⏳ Pending |
| 20  | Record demo video | ⏳ Pending |
| 20  | Final docs        | ✅ Done |

### Trần Thanh An

| Day | Task                 | Status |
| --- | -------------------- | ------ |
| 19  | Deploy backend       | 🔄 In Progress |
| 19  | Deploy frontend      | 🔄 In Progress |
| 20  | Deployment runbook   | ⏳ Pending |
| 20  | Seed production data | ⏳ Pending |

### Nguyễn Thị Ánh Ngọc

| Day | Task            | Status |
| --- | --------------- | ------ |
| 19  | Final QA        | ✅ Done |
| 19  | UI polish       | ✅ Done |
| 20  | Self-Assessment | ✅ Done |
| 20  | Help demo       | ⏳ Pending |

**Sprint 5 Deliverables:**

- 🔄 App deployed & accessible
- ⏳ Demo video recorded
- ✅ All docs completed

---

_Document Version: 1.1 | Last Updated: 16/01/2026_
