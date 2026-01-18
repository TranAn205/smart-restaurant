# 🚀 Hướng Dẫn Cài Đặt & Chạy Smart Restaurant

> **Đã test thành công** trên Windows 11 + Node.js v24.9.0 + PostgreSQL

---

## 📋 Yêu Cầu Hệ Thống

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **PostgreSQL** v14+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))

---

## 🔧 Bước 1: Cài Đặt PostgreSQL

### Windows
1. Tải và cài PostgreSQL từ link trên
2. **Ghi nhớ mật khẩu** cho user `postgres` (rất quan trọng!)
3. Mở **pgAdmin** hoặc **SQL Shell (psql)** và tạo database:

```sql
CREATE DATABASE smart_restaurant;
```

### Dùng psql (Terminal):
```bash
psql -U postgres
# Nhập mật khẩu PostgreSQL
CREATE DATABASE smart_restaurant;
\q
```

---

## 📦 Bước 2: Cài Đặt Dependencies

```bash
# Di chuyển vào project
cd smart-restaurant

# Cài đặt Backend
cd backend
npm install

# Cài đặt Frontend
cd ../frontend
npm install
```

> ⏱️ **Thời gian:** Backend ~82 packages, Frontend ~323 packages

---

## ⚙️ Bước 3: Cấu Hình Environment

### 🔴 QUAN TRỌNG: Tìm IP máy tính trước

Mở PowerShell/CMD và chạy:
```bash
ipconfig | findstr "IPv4"
```

Chọn IP dạng `192.168.x.x` (cùng mạng WiFi với điện thoại)

Ví dụ output:
```
IPv4 Address. . . . . . . . . . . : 192.168.1.7
```

---

### Backend: Tạo file `backend/.env`

```env
# ============================================
# SMART RESTAURANT BACKEND
# ============================================

# === DATABASE ===
# ⚠️ Thay YOUR_PASSWORD bằng mật khẩu PostgreSQL của bạn!
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/smart_restaurant

# === JWT SECRETS ===
JWT_SECRET=smart-restaurant-jwt-secret-key-2024
QR_JWT_SECRET=qr_secret_key

# === QR CODE - QUAN TRỌNG cho điện thoại quét ===
# ⚠️ Thay YOUR_IP bằng IP máy tính (ví dụ: 192.168.1.7)
CLIENT_BASE_URL=http://YOUR_IP.nip.io:3000

# === EMAIL (Optional - cho forgot password) ===
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# === GOOGLE OAUTH (Optional) ===
GOOGLE_CLIENT_ID=your-google-client-id

# === SERVER ===
PORT=4000
NODE_ENV=development
```

### Frontend: Tạo file `frontend/.env.local`

```bash
cd frontend
copy .env.local.example .env.local
```

Mở file `.env.local` và sửa:
```env
# ⚠️ Thay YOUR_IP bằng IP máy tính
NEXT_PUBLIC_API_URL=http://YOUR_IP:4000/api

# === GOOGLE OAUTH (Optional) ===
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 🗃️ Bước 4: Khởi Tạo Database

```bash
cd backend

# Chạy migration + seed data (tự động tạo tài khoản test)
npm run migrate
```

### ✅ Kết quả thành công:
```
🎉 MIGRATION & SEEDING COMPLETED SUCCESSFULLY!
📋 Test Accounts:
   Staff: admin@restaurant.com / 123456
   Waiter: waiter@restaurant.com / 123456
   Kitchen: kitchen@restaurant.com / 123456
   Guest: guest1@example.com / 123456
```

### ❌ Lỗi thường gặp:

**Lỗi `code: 28P01` - Authentication failed:**
```
severity: 'FATAL',
code: '28P01',
routine: 'auth_failed'
```
**Nguyên nhân:** Mật khẩu PostgreSQL trong `.env` không đúng

**Giải pháp:** Kiểm tra lại mật khẩu trong `DATABASE_URL`

---

## 🌱 Bước 5: Seed Data Mẫu (Optional)

Nếu muốn thêm nhiều data mẫu hơn (menu, orders, reviews...):

```bash
cd backend
node seed.js
```

### Dữ liệu được tạo:
- 👤 Users (Admin, Waiter, Kitchen, Guests)
- 🪑 Bàn ăn với locations khác nhau
- 🍔 Menu Items với 61 ảnh
- ⚙️ Modifiers (size, toppings...)
- 🧾 Orders với đầy đủ trạng thái
- 📊 Historical data 30 ngày cho Reports

---

## ▶️ Bước 6: Chạy Ứng Dụng

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```
Output: `🚀 Backend & Socket running on http://0.0.0.0:4000`

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
Output: `✓ Ready in xxxms` → http://localhost:3000

---

## 🔐 Bước 7: Đăng Nhập Test

### Tài khoản test (password: `123456`):

| Role | Email | Trang đăng nhập |
|------|-------|-----------------|
| **Admin** | `admin@restaurant.com` | `/admin/login` |
| **Waiter** | `waiter@restaurant.com` | `/waiter/login` |
| **Kitchen** | `kitchen@restaurant.com` | `/kitchen/login` |
| **Guest** | `guest1@example.com` | `/guest/login` |

---

## 📱 Bước 8: Quét QR Từ Điện Thoại

### Yêu cầu:
- ✅ Điện thoại và máy tính **cùng mạng WiFi**
- ✅ `CLIENT_BASE_URL` trong `.env` dùng IP máy tính (không phải `localhost`)

### Các bước:

1. **Đăng nhập Admin:** http://localhost:3000/admin/login
2. **Vào quản lý bàn:** Menu → Tables
3. **Tạo bàn mới:** Nhấn "Thêm bàn" → Điền thông tin → Lưu
4. **Tạo QR:** Nhấn nút **"Generate QR"** cho bàn vừa tạo
5. **Tải QR:** Download PNG hoặc PDF
6. **Quét từ điện thoại:** Mở Camera → Quét QR → Tự động mở menu

---

## 🧪 Các Trang Test Nhanh

| Trang | URL | Mô tả |
|-------|-----|-------|
| Admin Dashboard | `/admin/dashboard` | Thống kê, đơn hàng |
| Menu Management | `/admin/menu` | Quản lý danh mục, món |
| Table Management | `/admin/tables` | Quản lý bàn, QR |
| Kitchen Display | `/kitchen` | Màn hình bếp (KDS) |
| Waiter | `/waiter` | Giao diện phục vụ |
| Guest Menu | `/menu/guest` | Menu khách hàng |

---

## 🐛 Xử Lý Lỗi Thường Gặp

### 1. ❌ Lỗi kết nối database
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Giải pháp:** 
- Kiểm tra PostgreSQL đã chạy chưa (Services → postgresql)
- Kiểm tra `DATABASE_URL` trong `.env`

---

### 2. ❌ Lỗi authentication database (`28P01`)
```
code: '28P01', routine: 'auth_failed'
```
**Giải pháp:** Mật khẩu PostgreSQL trong `.env` sai. Sửa lại cho đúng.

---

### 3. ❌ Lỗi CORS khi quét QR
```
Access-Control-Allow-Origin
```
**Giải pháp:** 
- `NEXT_PUBLIC_API_URL` phải dùng IP (không phải localhost)
- `CLIENT_BASE_URL` phải dùng IP

---

### 4. ❌ QR không quét được trên điện thoại
**Giải pháp:**
- Kiểm tra điện thoại và máy tính cùng WiFi
- Kiểm tra Firewall không block port 3000, 4000
- Thử tắt Firewall tạm thời để test

---

### 5. ❌ Lỗi "Table not found" khi quét QR
**Giải pháp:** QR code cũ đã hết hạn, vào Admin → Tables → Generate QR mới

---

## 📊 Kiến Trúc Hệ Thống

```
┌─────────────────────┐     ┌─────────────────────┐
│   📱 Điện thoại      │     │   💻 Trình duyệt    │
│   (Quét QR)         │     │   (Admin/Kitchen)   │
└──────────┬──────────┘     └──────────┬──────────┘
           │                           │
           ▼                           ▼
┌──────────────────────────────────────────────────┐
│              Frontend (Next.js)                   │
│              http://YOUR_IP:3000                  │
└──────────────────────┬───────────────────────────┘
                       │ API Calls
                       ▼
┌──────────────────────────────────────────────────┐
│              Backend (Express.js)                 │
│              http://YOUR_IP:4000                  │
│              + Socket.IO (Real-time)              │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│              PostgreSQL Database                  │
│              localhost:5432                       │
└──────────────────────────────────────────────────┘
```

---

## ✅ Checklist Hoàn Thành

- [ ] Cài Node.js v18+
- [ ] Cài PostgreSQL và tạo database `smart_restaurant`
- [ ] Tìm IP máy tính (`ipconfig`)
- [ ] Tạo `backend/.env` với password PostgreSQL đúng
- [ ] Tạo `frontend/.env.local` với IP máy tính
- [ ] Chạy `npm install` cho cả backend và frontend
- [ ] Chạy `npm run migrate` (tự động seed data)
- [ ] (Optional) Chạy `node seed.js` để thêm data mẫu
- [ ] Chạy `npm run dev` cho backend (Terminal 1)
- [ ] Chạy `npm run dev` cho frontend (Terminal 2)
- [ ] Đăng nhập Admin: admin@restaurant.com / 123456
- [ ] Tạo bàn và Generate QR
- [ ] Test quét QR từ điện thoại

---

## 🎉 Chúc Bạn Setup Thành Công!

Nếu gặp vấn đề, hãy kiểm tra:
1. PostgreSQL đang chạy
2. Mật khẩu trong `.env` đúng
3. IP trong `.env` là IP máy tính (không phải localhost)
4. Điện thoại cùng WiFi với máy tính
