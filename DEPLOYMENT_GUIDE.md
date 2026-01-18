# 🚀 Hướng Dẫn Deploy Smart Restaurant Lên Internet

> Deploy **Frontend lên Vercel** + **Backend & Database lên Render** - Hoàn toàn miễn phí!

---

## 📋 Mục Lục

1. [Tổng Quan](#-tổng-quan)
2. [Chuẩn Bị](#-chuẩn-bị)
3. [Phần 1: Deploy Backend + Database trên Render](#-phần-1-deploy-backend--database-trên-render)
4. [Phần 2: Deploy Frontend trên Vercel](#-phần-2-deploy-frontend-trên-vercel)
5. [Phần 3: Kết Nối Frontend với Backend](#-phần-3-kết-nối-frontend-với-backend)
6. [Phần 4: Test Ứng Dụng](#-phần-4-test-ứng-dụng)
7. [Cấu Hình Google OAuth (Tùy chọn)](#-cấu-hình-google-oauth-tùy-chọn)
8. [Troubleshooting](#-troubleshooting)

---

## 🎯 Tổng Quan

### Tại sao chọn Vercel + Render?

| Nền tảng | Dùng cho | Ưu điểm |
|----------|----------|---------|
| **Vercel** | Frontend (Next.js) | Tối ưu cho Next.js, CDN toàn cầu, deploy siêu nhanh |
| **Render** | Backend + PostgreSQL | Dễ dùng, PostgreSQL miễn phí 90 ngày, tự động SSL |

### Kiến trúc sau khi deploy:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                      │
└─────────────────────────────────┬─────────────────────────────────────────┘
                                  │
            ┌─────────────────────┴─────────────────────┐
            ▼                                           ▼
┌───────────────────────────────┐       ┌───────────────────────────────────┐
│           VERCEL               │       │              RENDER               │
│  ┌─────────────────────────┐  │       │  ┌─────────────┐  ┌────────────┐  │
│  │      Frontend           │  │ API   │  │   Backend   │  │ PostgreSQL │  │
│  │      (Next.js)          │──────────▶  │  (Express)  │◀─│  Database  │  │
│  │                         │  │       │  │  Port 4000  │  │            │  │
│  └─────────────────────────┘  │       │  └─────────────┘  └────────────┘  │
│                               │       │                                    │
│   your-app.vercel.app        │       │   your-api.onrender.com           │
└───────────────────────────────┘       └───────────────────────────────────┘
```

### Chi phí:

| Dịch vụ | Chi phí |
|---------|---------|
| Vercel Free | **$0/tháng** (100GB bandwidth) |
| Render Free | **$0/tháng** (750 giờ/tháng, cold start) |
| PostgreSQL (Render) | **Miễn phí 90 ngày**, sau đó $7/tháng |

> ⚠️ **Lưu ý về Cold Start**: Plan miễn phí của Render sẽ "ngủ" sau 15 phút không hoạt động. Lần request đầu tiên sẽ mất 30-60 giây để khởi động lại.

---

## 📦 Chuẩn Bị

### Yêu cầu:

1. ✅ **Tài khoản GitHub** - Code đã push lên repository
2. ✅ **Email** - Để đăng ký Vercel và Render
3. ✅ (Tùy chọn) **Gmail** - Cho Google OAuth và gửi email

### Đảm bảo code đã push lên GitHub:

```bash
cd f:\Web\final\smart-restaurant

# Kiểm tra remote
git remote -v

# Push code mới nhất
git add .
git commit -m "Prepare for deployment"
git push origin main
```

---

# 🔧 Phần 1: Deploy Backend + Database trên Render

## Bước 1.1: Tạo tài khoản Render

1. Truy cập: **https://render.com**
2. Click **"Get Started for Free"**
3. Chọn **"Continue with GitHub"** (khuyến nghị)
4. Authorize Render truy cập GitHub

---

## Bước 1.2: Tạo PostgreSQL Database

### 1.2.1. Tạo Database mới

1. Từ Dashboard, click **"New +"** → **"PostgreSQL"**

2. Điền thông tin:

| Field | Giá trị |
|-------|---------|
| **Name** | `smart-restaurant-db` |
| **Database** | `smart_restaurant` |
| **User** | `smart_restaurant_user` |
| **Region** | `Singapore (Southeast Asia)` |
| **PostgreSQL Version** | `15` |
| **Instance Type** | **Free** |

3. Click **"Create Database"**

### 1.2.2. Chờ Database khởi động

Mất khoảng 1-2 phút. Status sẽ chuyển từ "Creating" → "Available"

### 1.2.3. Lấy Connection String

1. Click vào database vừa tạo
2. Scroll xuống phần **"Connections"**
3. Copy **"Internal Database URL"** (dùng cho backend cùng Render):
   ```
   postgres://smart_restaurant_user:xxxx@dpg-xxxx.singapore-postgres.render.com/smart_restaurant
   ```

4. **QUAN TRỌNG**: Thêm `?sslmode=require` vào cuối URL:
   ```
   postgres://smart_restaurant_user:xxxx@dpg-xxxx.singapore-postgres.render.com/smart_restaurant?sslmode=require
   ```

> 📝 Lưu URL này lại, sẽ dùng ở bước tiếp theo!

---

## Bước 1.3: Deploy Backend (Express.js)

### 1.3.1. Tạo Web Service

1. Từ Dashboard, click **"New +"** → **"Web Service"**

2. Chọn **"Build and deploy from a Git repository"** → **"Next"**

3. Connect repository:
   - Tìm và chọn repo **smart-restaurant**
   - Click **"Connect"**

### 1.3.2. Cấu hình Build Settings

Điền thông tin:

| Field | Giá trị |
|-------|---------|
| **Name** | `smart-restaurant-api` |
| **Region** | `Singapore (Southeast Asia)` |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

### 1.3.3. Thêm Environment Variables

Scroll xuống phần **"Environment Variables"**, click **"Add Environment Variable"** cho mỗi biến:

```
DATABASE_URL = postgres://...?sslmode=require  (URL từ bước 1.2.3)
PORT = 4000
NODE_ENV = production
JWT_SECRET = smart-restaurant-jwt-secret-2024-production
QR_JWT_SECRET = smart-restaurant-qr-secret-2024
CLIENT_BASE_URL = https://your-app.vercel.app
EMAIL_SERVICE = gmail
EMAIL_USER = your-email@gmail.com
EMAIL_PASS = your-gmail-app-password
GOOGLE_CLIENT_ID = your-google-client-id.apps.googleusercontent.com
```

> ⚠️ **Tạm thời**: `CLIENT_BASE_URL` sẽ cập nhật sau khi có URL Vercel

### 1.3.4. Deploy

1. Click **"Create Web Service"**
2. Render sẽ bắt đầu build và deploy
3. Theo dõi logs để xem tiến trình

### 1.3.5. Kiểm tra Backend hoạt động

Sau khi deploy xong (5-10 phút), bạn sẽ thấy:
- Status: **"Live"** (màu xanh)
- URL dạng: `https://smart-restaurant-api.onrender.com`

**Test bằng cách truy cập:**
```
https://smart-restaurant-api.onrender.com/health
```

Nếu thấy `{"status":"ok"}` → Backend đã hoạt động! ✅

> 📝 **Lưu URL backend này lại!** Ví dụ: `https://smart-restaurant-api.onrender.com`

---

# 🖥️ Phần 2: Deploy Frontend trên Vercel

## Bước 2.1: Tạo tài khoản Vercel

1. Truy cập: **https://vercel.com**
2. Click **"Sign Up"**
3. Chọn **"Continue with GitHub"**
4. Authorize Vercel

---

## Bước 2.2: Import Project

1. Từ Dashboard, click **"Add New..."** → **"Project"**

2. **Import Git Repository**:
   - Tìm repo **smart-restaurant**
   - Click **"Import"**

---

## Bước 2.3: Cấu hình Project

### 2.3.1. Configure Project

Điền thông tin:

| Field | Giá trị |
|-------|---------|
| **Project Name** | `smart-restaurant` |
| **Framework Preset** | `Next.js` (tự động detect) |
| **Root Directory** | Click **"Edit"** → Chọn `frontend` → **"Continue"** |

### 2.3.2. Environment Variables

Expand phần **"Environment Variables"** và thêm:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://smart-restaurant-api.onrender.com/api` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `your-google-client-id.apps.googleusercontent.com` |

> ⚠️ **QUAN TRỌNG**: 
> - Thay URL bằng URL backend thực từ Render (bước 1.3.5)
> - Phải có `/api` ở cuối!

### 2.3.3. Deploy

1. Click **"Deploy"**
2. Vercel sẽ build và deploy (2-5 phút)
3. Xem logs để theo dõi tiến trình

### 2.3.4. Nhận URL Frontend

Sau khi deploy xong:
- URL dạng: `https://smart-restaurant.vercel.app`
- Hoặc: `https://smart-restaurant-xxx.vercel.app`

> 📝 **Lưu URL frontend này lại!**

---

# 🔗 Phần 3: Kết Nối Frontend với Backend

## Bước 3.1: Cập nhật CLIENT_BASE_URL trên Render

> **Rất quan trọng** cho QR code hoạt động!

1. Quay lại **Render Dashboard**
2. Vào service **smart-restaurant-api**
3. Click tab **"Environment"**
4. Tìm `CLIENT_BASE_URL` và sửa thành URL Vercel thực:
   ```
   CLIENT_BASE_URL = https://smart-restaurant.vercel.app
   ```
5. Click **"Save Changes"**
6. Render sẽ tự động redeploy (2-3 phút)

---

## Bước 3.2: (Tùy chọn) Custom Domain

### Thêm domain cho Frontend (Vercel):

1. Vào project trên Vercel → **"Settings"** → **"Domains"**
2. Nhập domain: `restaurant.yourdomain.com`
3. Vercel cung cấp **CNAME** hoặc **A record**
4. Thêm record vào DNS provider của bạn

### Thêm domain cho Backend (Render):

1. Vào service trên Render → **"Settings"**
2. Phần **"Custom Domains"** → **"Add Custom Domain"**
3. Nhập: `api.yourdomain.com`
4. Thêm CNAME record theo hướng dẫn

---

# ✅ Phần 4: Test Ứng Dụng

## 4.1. Truy cập Frontend

Mở URL từ Vercel: `https://smart-restaurant.vercel.app`

## 4.2. Đăng nhập Test

| Role | Email | Password | Trang đăng nhập |
|------|-------|----------|-----------------|
| **Admin** | admin@restaurant.com | 123456 | `/admin/login` |
| **Waiter** | waiter@restaurant.com | 123456 | `/waiter/login` |
| **Kitchen** | kitchen@restaurant.com | 123456 | `/kitchen/login` |
| **Guest** | guest1@example.com | 123456 | `/guest/login` |

## 4.3. Test QR Code

1. Đăng nhập Admin: `https://your-app.vercel.app/admin/login`
2. Vào **Tables** → Tạo bàn mới hoặc chọn bàn có sẵn
3. Click **"Generate QR"** hoặc **"Tạo QR"**
4. Tải QR về → Quét bằng điện thoại
5. Menu phải mở được và có thể đặt đơn!

## 4.4. Test Real-time (Socket.IO)

1. **Máy 1**: Mở Kitchen Display (`/kitchen`)
2. **Máy 2 hoặc điện thoại**: Đặt đơn từ Guest Menu
3. Đơn mới phải hiện **ngay lập tức** trên màn hình bếp!

## 4.5. Test Flow hoàn chỉnh

```
Guest đặt đơn → Waiter thấy đơn mới → Kitchen nhận đơn → 
Nấu xong → Waiter serve → Guest thanh toán ✓
```

---

# 🔑 Cấu Hình Google OAuth (Tùy chọn)

## Bước 1: Tạo OAuth Credentials

1. Vào [Google Cloud Console](https://console.cloud.google.com)
2. Tạo hoặc chọn project
3. **APIs & Services** → **Credentials** → **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
4. Application type: **"Web application"**

## Bước 2: Cấu hình Authorized Origins & Redirects

**Authorized JavaScript origins:**
```
https://smart-restaurant.vercel.app
https://your-custom-domain.com
```

**Authorized redirect URIs:**
```
https://smart-restaurant.vercel.app
https://smart-restaurant.vercel.app/guest/login
```

## Bước 3: Cập nhật Environment Variables

### Trên Render (Backend):
```
GOOGLE_CLIENT_ID = your-client-id.apps.googleusercontent.com
```

### Trên Vercel (Frontend):
1. Vào Project → **Settings** → **Environment Variables**
2. Add hoặc Update:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID = your-client-id.apps.googleusercontent.com
```
3. **Redeploy** để áp dụng thay đổi:
   - Vào **Deployments** → Click **"..."** → **"Redeploy"**

---

# 🔧 Troubleshooting

## ❌ Lỗi 1: "Application error" khi truy cập Backend

**Nguyên nhân**: Backend đang "ngủ" (cold start)

**Giải pháp**: Đợi 30-60 giây, refresh lại. Đây là hạn chế của free tier.

---

## ❌ Lỗi 2: Database Connection Failed

**Logs hiện**: `Error: Connection refused` hoặc `ECONNREFUSED`

**Giải pháp**:
1. Kiểm tra `DATABASE_URL` có `?sslmode=require` ở cuối
2. Kiểm tra database đang "Available" trên Render
3. URL phải dùng **External Database URL** nếu test từ local

---

## ❌ Lỗi 3: CORS Error

**Browser hiện**: `Access-Control-Allow-Origin`

**Giải pháp**:
1. Kiểm tra `NEXT_PUBLIC_API_URL` on Vercel có đúng URL backend không
2. Đảm bảo không có dấu `/` thừa ở cuối backend URL
3. Redeploy cả backend và frontend

---

## ❌ Lỗi 4: QR Code không quét được

**Giải pháp**:
1. Kiểm tra `CLIENT_BASE_URL` trên Render = URL Vercel chính xác
2. Redeploy backend sau khi sửa
3. Generate QR mới

---

## ❌ Lỗi 5: Build Failed trên Vercel

**Logs hiện**: `next build failed`

**Giải pháp**:
1. Kiểm tra **Root Directory** = `frontend`
2. Kiểm tra tất cả Environment Variables đã add
3. Local test: `npm run build` trong folder frontend

---

## ❌ Lỗi 6: Build Failed trên Render

**Logs hiện**: `npm ERR!` 

**Giải pháp**:
1. Kiểm tra **Root Directory** = `backend`
2. Kiểm tra Node version: Render dùng Node 18+ mặc định
3. Kiểm tra `package.json` có tất cả dependencies

---

## ❌ Lỗi 7: Real-time không hoạt động

**Socket.IO không connect**

**Giải pháp**:
1. Cả Vercel và Render đều hỗ trợ WebSocket
2. Kiểm tra frontend đang connect đúng backend URL
3. Mở Console (F12) xem lỗi chi tiết

---

# 📊 So Sánh Với Railway

| Tiêu chí | Vercel + Render | Railway |
|----------|-----------------|---------|
| **Frontend Speed** | ⭐⭐⭐⭐⭐ (CDN toàn cầu) | ⭐⭐⭐ |
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Cold Start** | Có (Render free) | Không |
| **PostgreSQL Free** | 90 ngày | Không giới hạn |
| **Best For** | Next.js frontend | Full-stack |

---

# 🔄 Cập Nhật Ứng Dụng

## Auto-deploy:

Cả Vercel và Render đều **auto-deploy** khi push code:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

## Manual Redeploy:

### Vercel:
- Dashboard → Project → **Deployments** → **"..."** → **"Redeploy"**

### Render:
- Dashboard → Service → **"Manual Deploy"** → **"Deploy latest commit"**

---

# 📋 Checklist Hoàn Thành

### Render:
- [ ] Tạo tài khoản Render
- [ ] Tạo PostgreSQL database
- [ ] Lấy DATABASE_URL (có `?sslmode=require`)
- [ ] Deploy Backend với đầy đủ environment variables
- [ ] Backend health check thành công

### Vercel:
- [ ] Tạo tài khoản Vercel
- [ ] Import project với Root Directory = `frontend`
- [ ] Add `NEXT_PUBLIC_API_URL` (có `/api` ở cuối)
- [ ] Deploy thành công

### Kết nối:
- [ ] Cập nhật `CLIENT_BASE_URL` trên Render = URL Vercel
- [ ] Redeploy backend

### Test:
- [ ] Đăng nhập Admin thành công
- [ ] Tạo bàn và Generate QR
- [ ] Quét QR từ điện thoại - mở được menu
- [ ] Đặt đơn từ Guest - Kitchen thấy real-time
- [ ] Flow thanh toán hoạt động

---

# 🎉 Chúc Mừng!

Bạn đã deploy thành công Smart Restaurant!

### URLs của bạn:

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | `https://smart-restaurant.vercel.app` |
| **Backend API (Render)** | `https://smart-restaurant-api.onrender.com/api` |
| **Health Check** | `https://smart-restaurant-api.onrender.com/health` |

### Tips:
- 🔄 Backend "ngủ" sau 15 phút → Request đầu tiên mất 30-60s
- 💡 Để tránh cold start: Dùng [UptimeRobot](https://uptimerobot.com) ping mỗi 14 phút
- 📊 90 ngày free PostgreSQL → Sau đó backup và upgrade hoặc migrate sang Railway

---

## 📞 Hỗ Trợ

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
