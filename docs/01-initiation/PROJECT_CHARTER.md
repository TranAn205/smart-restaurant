# Project Charter - Smart Restaurant

## Thông Tin Chung

| Mục                 | Chi tiết                                   |
| ------------------- | ------------------------------------------ |
| **Project Name**    | Smart Restaurant - QR Menu Ordering System |
| **Project Manager** | Nguyễn Lê Thế Vinh (Team Lead)             |
| **Start Date**      | 03/01/2026                                 |
| **End Date**        | 22/01/2026                                 |
| **Duration**        | 20 ngày                                    |
| **Team Size**       | 3 người                                    |
| **GitHub Repo**     | https://github.com/TranAn205/smart-restaurant |

---

## 1. Project Overview

**Smart Restaurant** là hệ thống đặt món qua QR code cho dịch vụ dine-in, cho phép:

- Khách scan QR → xem menu → đặt món → theo dõi trạng thái → thanh toán
- Waiter xử lý order, gửi xuống bếp
- Kitchen Staff theo dõi qua KDS (Kitchen Display System)
- Admin quản lý menu, bàn, báo cáo

---

## 2. Objectives (Mục Tiêu)

### Business Objectives

1. ✅ Xây dựng hệ thống order món ăn qua QR code hoàn chỉnh
2. ✅ Tích hợp KDS real-time cho bếp
3. ✅ Hỗ trợ thanh toán online (Stripe/mock)
4. ✅ Dashboard báo cáo doanh thu

### Technical Objectives

1. ✅ Frontend: React/NextJS - SPA responsive
2. ✅ Backend: NodeJS + Express + Socket.IO
3. ✅ Database: PostgreSQL/MySQL
4. ✅ Authentication: JWT + Passport.js

---

## 3. Scope Definition

### ✅ In Scope (Bao gồm)

| Module              | Features                                       |
| ------------------- | ---------------------------------------------- |
| **Guest Ordering**  | Menu browsing, cart, order, tracking, payment  |
| **Authentication**  | Login, register, JWT, Google OAuth             |
| **Admin Panel**     | Menu CRUD, Table + QR, Staff accounts, Reports |
| **Waiter Workflow** | Accept/reject orders, serve, bill              |
| **KDS**             | Real-time order display, status update         |
| **Payment**         | Bill, Stripe integration                       |

### ❌ Out of Scope (Không bao gồm)

- Multi-tenant support (nhiều nhà hàng)
- Native mobile app (iOS/Android)
- Inventory management
- Delivery/takeout

---

## 4. Stakeholders

| Stakeholder | Role                    | Interest               | GitHub |
| ----------- | ----------------------- | ---------------------- | ------ |
| Giảng viên  | Evaluator               | Đánh giá final project | -      |
| Nguyễn Lê Thế Vinh | Team Lead / FE Customer | Delivery, demo | Zinthw |
| Trần Thanh An | Backend / Infra | API, Socket, Deploy | Gaaus56 |
| Nguyễn Thị Ánh Ngọc | FE Admin / QA | Admin UI, Testing | angquoc |

---

## 5. Success Criteria (Tiêu Chí Thành Công)

| #   | Criteria                                        | Measurement                |
| --- | ----------------------------------------------- | -------------------------- |
| 1   | Tất cả features trong Self-Assessment hoạt động | Self-evaluation score      |
| 2   | Demo video 5-10 phút                            | Video uploaded             |
| 3   | Deployed to public URL                          | Accessible link            |
| 4   | Git history meaningful commits                  | ≥50 commits, branches, PRs |
| 5   | Documentation đầy đủ                            | All required docs complete |

---

## 6. Constraints & Assumptions

| Type           | Description                   |
| -------------- | ----------------------------- |
| **Time**       | 20 ngày (03/01 - 22/01/2026)  |
| **Resources**  | 3 developers                  |
| **Technology** | React, NodeJS, SQL, Socket.IO |

**Assumptions:** Team có kiến thức React/NodeJS cơ bản, Git workflow setup sẵn.

---

## 7. Milestones

| Milestone                  | Target Date | Deliverables                   |
| -------------------------- | ----------- | ------------------------------ |
| **M1: Guest Ordering MVP** | 09/01/2026  | Cart, Order, Status tracking   |
| **M2: KDS & Waiter**       | 14/01/2026  | KDS real-time, Waiter workflow |
| **M3: Payment & Reports**  | 18/01/2026  | Payment flow, Admin reports    |
| **M4: Deploy & Demo**      | 22/01/2026  | Public URL, Demo video         |

---

## 8. Approval

| Role            | Name                   | Student ID | Date       |
| --------------- | ---------------------- | ---------- | ---------- |
| Project Manager | Nguyễn Lê Thế Vinh     | 23120190   | 16/01/2026 |
| Team Member     | Trần Thanh An          | 23120017   | 16/01/2026 |
| Team Member     | Nguyễn Thị Ánh Ngọc    | 23120061   | 16/01/2026 |

---

_Document Version: 1.1 | Last Updated: 16/01/2026_
