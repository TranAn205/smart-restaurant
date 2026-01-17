# 📚 Smart Restaurant Backend API Documentation

Hệ thống Backend quản lý nhà hàng thông minh với tính năng đặt món qua QR, KDS (Kitchen Display System), quản lý nhân viên và báo cáo doanh thu.

**Base URL:** `http://localhost:4000/api`
**Auth Header:** `Authorization: Bearer <TOKEN>`

---

## 🗄️ 1. Database Schema (PostgreSQL)

Cấu trúc dữ liệu được tự động khởi tạo qua file `migrate.js`.

| Table Name          | Description                                       | Key Columns                                                                                       |
| :------------------ | :------------------------------------------------ | :------------------------------------------------------------------------------------------------ |
| **users**           | Lưu trữ thông tin Admin, Staff, Kitchen và Guest. | `id`, `email`, `role`, `status`, `auth_provider`, `google_id`, `verification_token`, `avatar_url` |
| **tables**          | Danh sách bàn ăn và mã QR.                        | `id`, `table_number`, `capacity`, `qr_token`, `status`                                            |
| **menu_categories** | Danh mục món ăn (Khai vị, Món chính...).          | `id`, `name`, `sort_order`                                                                        |
| **menu_items**      | Món ăn chi tiết.                                  | `id`, `name`, `price`, `description`, `is_chef_recommended`                                       |
| **modifier_groups** | Nhóm tùy chọn (vd: Mức độ chín, Topping).         | `id`, `name`, `selection_type`, `is_required`                                                     |
| **reviews**         | Đánh giá món ăn từ khách hàng.                    | `id`, `user_id`, `menu_item_id`, `rating`, `comment`                                              |
| **orders**          | Đơn hàng tổng quát.                               | `id`, `table_id`, `user_id` (link khách), `status` (pending/paid...), `total_amount`              |
| **order_items**     | Chi tiết món trong đơn hàng.                      | `id`, `order_id`, `menu_item_id`, `quantity`, `modifiers_selected`, `status` (pending/ready...)   |

---

## 🔐 2. Authentication & Users

### 🟢 Guest Authentication (Khách hàng)

| Method | Endpoint                | Description                                    | Auth   |
| :----- | :---------------------- | :--------------------------------------------- | :----- |
| `POST` | `/auth/guest/register`  | Đăng ký tài khoản mới (Gửi email xác thực).    | Public |
| `POST` | `/auth/verify-email`    | Xác thực email bằng token.                     | Public |
| `POST` | `/auth/login`           | Đăng nhập (Email/Pass).                        | Public |
| `POST` | `/auth/google`          | Đăng nhập/Đăng ký bằng Google (Gửi `idToken`). | Public |
| `POST` | `/auth/forgot-password` | Yêu cầu gửi mail reset mật khẩu.               | Public |
| `POST` | `/auth/reset-password`  | Đặt lại mật khẩu mới.                          | Public |

### 👤 User Profile (Quản lý tài khoản)

| Method | Endpoint                 | Description                                        | Auth  |
| :----- | :----------------------- | :------------------------------------------------- | :---- |
| `GET`  | `/users/profile`         | Lấy thông tin cá nhân.                             | Token |
| `PUT`  | `/users/profile`         | Cập nhật thông tin & Avatar (Multipart/form-data). | Token |
| `PUT`  | `/users/change-password` | Đổi mật khẩu (Yêu cầu mật khẩu cũ).                | Token |
| `GET`  | `/users/history`         | Xem lịch sử đơn hàng của bản thân.                 | Token |

### 🛡️ Admin & Staff Management (Quản trị)

| Method | Endpoint         | Description                                           | Auth           |
| :----- | :--------------- | :---------------------------------------------------- | :------------- |
| `POST` | `/auth/register` | Admin tạo tài khoản nhân viên (Staff/Waiter/Kitchen). | **Admin Only** |
| `GET`  | `/users`         | Admin xem danh sách nhân viên.                        | **Admin Only** |

---

## 🍔 3. Menu & Ordering (Public/Guest)

Dành cho khách hàng quét QR Code hoặc xem menu.

| Method  | Endpoint                       | Description                                                               | Auth   |
| :------ | :----------------------------- | :------------------------------------------------------------------------ | :----- |
| `GET`   | `/menu`                        | Lấy toàn bộ thực đơn (Categories & Items). Filter: `?q=`, `?categoryId=`. | Public |
| `GET`   | `/menu/verify`                 | Kiểm tra token QR có hợp lệ không (`?token=...&tableId=...`).             | Public |
| `POST`  | `/orders`                      | **Tạo đơn hàng mới**. Body: `{ table_id, items: [...] }`.                 | Public |
| `PATCH` | `/orders/:id/items`            | **Gọi thêm món** vào đơn hàng đang ăn.                                    | Public |
| `GET`   | `/orders/:id`                  | Xem chi tiết đơn hàng (trạng thái, món ăn).                               | Public |
| `GET`   | `/orders/table/:tableId/order` | Lấy đơn hàng _đang phục vụ_ của bàn.                                      | Public |

---

## ⭐ 4. Reviews (Đánh giá)

| Method | Endpoint                | Description                            | Auth   |
| :----- | :---------------------- | :------------------------------------- | :----- |
| `GET`  | `/reviews/item/:itemId` | Xem danh sách đánh giá của một món ăn. | Public |
| `POST` | `/reviews`              | Viết đánh giá món ăn.                  | Token  |

---

## 🤵 5. Waiter API (Phục vụ)

Dành cho App nhân viên phục vụ. **Yêu cầu Token (Role: Waiter/Admin)**.

| Method  | Endpoint                    | Description                                                  | Auth            |
| :------ | :-------------------------- | :----------------------------------------------------------- | :-------------- |
| `GET`   | `/waiter/orders`            | Lấy danh sách đơn hàng. Filter: `?status=pending`.           | **Waiter Only** |
| `PATCH` | `/waiter/orders/:id/accept` | **Xác nhận đơn**. Chuyển trạng thái `pending` -> `accepted`. | **Waiter Only** |
| `PATCH` | `/waiter/orders/:id/reject` | **Từ chối đơn**. Chuyển trạng thái sang `cancelled`.         | **Waiter Only** |
| `PATCH` | `/waiter/orders/:id/served` | **Đã phục vụ**. Chuyển trạng thái `ready` -> `served`.       | **Waiter Only** |

---

## 👨‍🍳 6. Kitchen API (KDS - Bếp)

Dành cho màn hình bếp. **Yêu cầu Token (Role: Kitchen/Admin)**.

| Method  | Endpoint                        | Description                                               | Auth             |
| :------ | :------------------------------ | :-------------------------------------------------------- | :--------------- |
| `GET`   | `/kitchen/orders`               | Lấy danh sách món cần làm.                                | **Kitchen Only** |
| `PATCH` | `/kitchen/items/:itemId/status` | Cập nhật trạng thái **từng món** (`preparing` / `ready`). | **Kitchen Only** |
| `PATCH` | `/kitchen/orders/:id/ready`     | Báo **cả đơn hàng** đã xong -> `ready`.                   | **Kitchen Only** |

---

## 💳 7. Payment API (Thanh toán)

| Method | Endpoint                        | Description                                      | Auth  |
| :----- | :------------------------------ | :----------------------------------------------- | :---- |
| `GET`  | `/payment/tables/:tableId/bill` | Lấy hóa đơn tạm tính của bàn.                    | Token |
| `POST` | `/payment/orders/:id/pay`       | Thực hiện thanh toán (Mock). Chuyển sang `paid`. | Token |
| `GET`  | `/payment/orders/:id/receipt`   | Lấy biên lai sau khi thanh toán thành công.      | Token |

---

## 📈 8. Admin Reports (Báo cáo)

Dành cho chủ nhà hàng. **Yêu cầu Token (Role: Admin)**.

| Method | Endpoint                   | Description                                                | Auth           |
| :----- | :------------------------- | :--------------------------------------------------------- | :------------- |
| `GET`  | `/admin/reports/summary`   | Dashboard tổng quan (Doanh thu hôm nay, Đơn đang phục vụ). | **Admin Only** |
| `GET`  | `/admin/reports/daily`     | Biểu đồ doanh thu theo ngày.                               | **Admin Only** |
| `GET`  | `/admin/reports/top-items` | Top 10 món bán chạy nhất.                                  | **Admin Only** |

---

## 🍽️ 9. Table Management API

| Method   | Endpoint             | Description                          | Auth           |
| :------- | :------------------- | :----------------------------------- | :------------- |
| `GET`    | `/tables`            | Lấy danh sách tất cả bàn.            | Token          |
| `GET`    | `/tables/:id`        | Lấy thông tin chi tiết một bàn.      | Token          |
| `POST`   | `/tables`            | Tạo bàn mới.                         | **Admin Only** |
| `PUT`    | `/tables/:id`        | Cập nhật thông tin bàn.              | **Admin Only** |
| `DELETE` | `/tables/:id`        | Xóa bàn.                             | **Admin Only** |
| `POST`   | `/tables/:id/qr`     | Tạo mới QR token cho bàn.            | **Admin Only** |
| `PATCH`  | `/tables/:id/status` | Cập nhật trạng thái bàn (available). | Token          |

---

## 📋 10. Menu Management API (Admin)

| Method   | Endpoint                    | Description                     | Auth           |
| :------- | :-------------------------- | :------------------------------ | :------------- |
| `POST`   | `/menu/categories`          | Tạo danh mục món ăn mới.        | **Admin Only** |
| `PUT`    | `/menu/categories/:id`      | Cập nhật danh mục.              | **Admin Only** |
| `DELETE` | `/menu/categories/:id`      | Xóa danh mục.                   | **Admin Only** |
| `POST`   | `/menu/items`               | Thêm món ăn mới (với ảnh).      | **Admin Only** |
| `PUT`    | `/menu/items/:id`           | Cập nhật thông tin món ăn.      | **Admin Only** |
| `DELETE` | `/menu/items/:id`           | Xóa món ăn.                     | **Admin Only** |
| `POST`   | `/menu/modifier-groups`     | Tạo nhóm tùy chọn (Topping...). | **Admin Only** |
| `PUT`    | `/menu/modifier-groups/:id` | Cập nhật nhóm tùy chọn.         | **Admin Only** |
| `DELETE` | `/menu/modifier-groups/:id` | Xóa nhóm tùy chọn.              | **Admin Only** |

---

## ⚡ 11. Socket.io Events (Real-time)

Hệ thống sử dụng Socket.io tại port `4000`.

### Rooms

- `table:{tableId}`: Dành cho khách ngồi tại bàn (nhận update trạng thái đơn của mình).
- `role:waiter`: Dành cho nhân viên phục vụ (nhận đơn mới, yêu cầu thanh toán).
- `role:kitchen`: Dành cho bếp (nhận món mới cần nấu).

### Events (Server emits)

1.  `order:new`: Bắn cho **Waiter** khi có khách đặt món.
2.  `order:update`: Bắn cho **Khách** khi trạng thái đơn thay đổi (Accepted, Cooking...).
3.  `order:new_task`: Bắn cho **Bếp** khi Waiter xác nhận đơn.
4.  `item:ready`: Bắn cho **Waiter** khi một món ăn đã nấu xong.
5.  `order:ready`: Bắn cho **Waiter** khi toàn bộ đơn hàng đã xong.
6.  `payment:request`: Bắn cho **Waiter** khi khách yêu cầu thanh toán.
7.  `order:paid`: Bắn cho **tất cả** khi đơn hàng đã thanh toán thành công.

### Events (Client emits)

1.  `join:table`: Khách tham gia room bàn khi quét QR.
2.  `join:role`: Nhân viên tham gia room theo role (waiter/kitchen).
3.  `leave:table`: Rời khỏi room bàn.
