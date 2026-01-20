# Hướng Dẫn Thiết Lập Database

## Yêu Cầu Hệ Thống

- PostgreSQL 12+
- Node.js 18+

## Cấu Hình Kết Nối

Tạo file `.env` trong thư mục `backend/` với nội dung:

```properties
DATABASE_URL=postgres://username:password@localhost:5432/smart_restaurant
NODE_ENV=development
```

---

## Chạy Migration Script

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Tạo database (PostgreSQL)

Mở terminal PostgreSQL hoặc pgAdmin:

```sql
CREATE DATABASE smart_restaurant;
```

### 3. Chạy migration

```bash
npm run migrate
```

**Script này thực hiện:**

1. Kích hoạt extension `pgcrypto` (hỗ trợ UUID)
2. Reset toàn bộ schema (`DROP SCHEMA public CASCADE`)
3. Tạo lại các bảng theo thứ tự dependency
4. Tạo indexes cho tối ưu truy vấn

### 4. Seed dữ liệu demo

```bash
npm run seed
```

### 5. Chạy đầy đủ (migrate + seed + start server)

```bash
npm start
```

---

## Thứ Tự Thực Thi

| Lệnh              | Mục đích               | Ghi chú                  |
| ----------------- | ---------------------- | ------------------------ |
| `npm run migrate` | Tạo cấu trúc bảng      | Reset toàn bộ dữ liệu cũ |
| `npm run seed`    | Thêm dữ liệu demo      | Chạy sau migrate         |
| `npm run dev`     | Chạy server (dev mode) | Auto-reload khi thay đổi |
| `npm start`       | Production             | migrate + seed + start   |

---

## Sơ Đồ Cấu Trúc Database

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SMART RESTAURANT DATABASE                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────────┐
│    users     │       │    tables    │       │ menu_categories  │
├──────────────┤       ├──────────────┤       ├──────────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)          │
│ email        │       │ table_number │       │ name             │
│ password_hash│       │ capacity     │       │ description      │
│ full_name    │       │ location     │       │ image_url        │
│ phone        │       │ status       │       │ status           │
│ role         │       │ qr_token     │       │ sort_order       │
│ status       │       │ created_at   │       │ deleted_at       │
│ auth_provider│       └──────┬───────┘       └────────┬─────────┘
│ google_id    │              │                        │
│ total_points │              │                        │
│ tier         │              │                        ▼
└──────┬───────┘              │               ┌──────────────────┐
       │                      │               │   menu_items     │
       │                      │               ├──────────────────┤
       │                      │               │ id (PK)          │
       │                      │               │ category_id (FK) │◄───┐
       │                      │               │ name             │    │
       │                      │               │ description      │    │
       │                      │               │ price            │    │
       │                      │               │ status           │    │
       │                      │               │ is_chef_recommended   │
       │                      │               │ prep_time_minutes│    │
       │                      │               │ order_count      │    │
       │                      │               └────────┬─────────┘    │
       │                      │                        │              │
       │                      │          ┌─────────────┼──────────────┘
       │                      │          │             │
       │                      │          ▼             ▼
       │                      │  ┌───────────────┐  ┌──────────────────────────┐
       │                      │  │menu_item_photos│  │menu_item_modifier_groups│
       │                      │  ├───────────────┤  ├──────────────────────────┤
       │                      │  │ id (PK)       │  │ menu_item_id (FK)        │
       │                      │  │ menu_item_id  │  │ modifier_group_id (FK)   │
       │                      │  │ photo_url     │  │ sort_order               │
       │                      │  │ is_primary    │  └────────────┬─────────────┘
       │                      │  └───────────────┘               │
       │                      │                                  │
       │                      │                    ┌─────────────┴────────────────┐
       │                      │                    │                              │
       │                      │                    ▼                              │
       │                      │          ┌──────────────────┐                     │
       │                      │          │ modifier_groups  │                     │
       │                      │          ├──────────────────┤                     │
       │                      │          │ id (PK)          │                     │
       │                      │          │ name             │                     │
       │                      │          │ selection_type   │                     │
       │                      │          │ is_required      │                     │
       │                      │          │ min_selection    │                     │
       │                      │          │ max_selection    │                     │
       │                      │          └────────┬─────────┘                     │
       │                      │                   │                               │
       │                      │                   ▼                               │
       │                      │          ┌──────────────────┐                     │
       │                      │          │ modifier_options │                     │
       │                      │          ├──────────────────┤                     │
       │                      │          │ id (PK)          │                     │
       │                      │          │ group_id (FK)    │                     │
       │                      │          │ name             │                     │
       │                      │          │ price_adjustment │                     │
       │                      │          │ status           │                     │
       │                      │          └──────────────────┘                     │
       │                      │                                                   │
       ▼                      ▼                                                   │
   ┌─────────────────────────────────────┐                                        │
   │              orders                 │                                        │
   ├─────────────────────────────────────┤                                        │
   │ id (PK)                             │                                        │
   │ table_id (FK) ──────────────────────┼────────────────────────────────────────┘
   │ user_id (FK)                        │
   │ customer_name                       │
   │ customer_phone                      │
   │ status                              │
   │ total_amount                        │
   │ discount_amount                     │
   │ notes                               │
   │ created_at                          │
   │ paid_at                             │
   └─────────────────┬───────────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  order_items    │
            ├─────────────────┤
            │ id (PK)         │
            │ order_id (FK)   │
            │ menu_item_id(FK)│
            │ quantity        │
            │ price_per_unit  │
            │ total_price     │
            │ modifiers_selected (JSONB) │
            │ notes           │
            │ status          │
            └─────────────────┘

            ┌──────────────────┐
            │     reviews      │
            ├──────────────────┤
            │ id (PK)          │
            │ user_id (FK)     │──────► users
            │ menu_item_id(FK) │──────► menu_items
            │ rating (1-5)     │
            │ comment          │
            │ created_at       │
            └──────────────────┘
```

---

## Dữ Liệu Demo (Seed Data)

### Tài Khoản Người Dùng

| Email                  | Mật khẩu | Role    | Mô tả               |
| ---------------------- | -------- | ------- | ------------------- |
| `admin@restaurant.com` | 123456   | admin   | Quản trị hệ thống   |
| `waiter1@res.com`      | 123456   | waiter  | Nhân viên phục vụ   |
| `waiter2@res.com`      | 123456   | waiter  | Nhân viên phục vụ   |
| `kitchen1@res.com`     | 123456   | kitchen | Đầu bếp             |
| `kitchen2@res.com`     | 123456   | kitchen | Phó bếp             |
| `guest1@gmail.com`     | 123456   | guest   | Khách hàng (Silver) |
| `guest2@gmail.com`     | 123456   | guest   | Khách hàng (Gold)   |

### Bàn Ăn (10 bàn)

| Số bàn  | Sức chứa | Vị trí         |
| ------- | -------- | -------------- |
| A01-A04 | 2-4      | Tầng 1         |
| B01-B02 | 6        | Tầng 1 - Khu B |
| VIP01   | 8        | Tầng 2 - VIP   |
| VIP02   | 10       | Tầng 2 - VIP   |
| R01-R02 | 4        | Rooftop        |

### Menu (17 món)

| Danh mục    | Số món | Ví dụ                               |
| ----------- | ------ | ----------------------------------- |
| Khai vị     | 4      | Gỏi cuốn, Chả giò, Salad, Súp       |
| Món chính   | 6      | Phở bò, Bún chả, Bò bít tết, Cá hồi |
| Đồ uống     | 4      | Trà sữa, Cà phê, Sinh tố, Nước ép   |
| Tráng miệng | 3      | Tiramisu, Chè Thái, Bánh Flan       |

### Modifier Groups

| Nhóm         | Loại     | Tùy chọn                         |
| ------------ | -------- | -------------------------------- |
| Chọn Size    | single   | Size M (mặc định), Size L (+10k) |
| Topping thêm | multiple | Trân châu, Thạch dừa, Kem cheese |
| Độ cay       | single   | Không cay → Cay nhiều            |

### Đơn Hàng Demo (10 đơn)

| Trạng thái | Số lượng | Mục đích demo       |
| ---------- | -------- | ------------------- |
| pending    | 3        | Waiter xác nhận đơn |
| accepted   | 2        | Kitchen nhận đơn    |
| preparing  | 2        | Bếp đang nấu        |
| ready      | 2        | Waiter mang món ra  |
| served     | 1        | Chờ thanh toán      |

---

## Xử Lý Lỗi Thường Gặp

### Lỗi kết nối database

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Giải pháp:**

1. Kiểm tra PostgreSQL đang chạy: `sudo service postgresql status`
2. Kiểm tra `DATABASE_URL` trong `.env`
3. Đảm bảo database `smart_restaurant` đã được tạo

### Lỗi permission

```
Error: permission denied for schema public
```

**Giải pháp:**

```sql
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON DATABASE smart_restaurant TO postgres;
```

### Lỗi extension pgcrypto

```
Error: extension "pgcrypto" is not available
```

**Giải pháp:**

```bash
# Ubuntu/Debian
sudo apt-get install postgresql-contrib

# macOS (Homebrew)
brew install postgresql
```

### Reset hoàn toàn database

```bash
# Chạy lại migration (xóa toàn bộ dữ liệu)
npm run migrate

# Sau đó seed lại
npm run seed
```
