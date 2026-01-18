# 🐳 Docker Setup - Smart Restaurant

## Yêu cầu
- **Docker Desktop** đã cài đặt và đang chạy
- Tải tại: https://www.docker.com/products/docker-desktop

---

## 📁 Cấu trúc file môi trường cho Docker

Khi chạy Docker, bạn **CHỈ CẦN TẠO 1 FILE** `.env` ở thư mục root:

```
smart-restaurant/
├── .env                  ← CHỈ CẦN TẠO FILE NÀY
├── .env.docker.example   ← Template mẫu
├── docker-compose.yml
├── backend/
└── frontend/
```

> Docker sẽ tự động lấy biến từ `.env` và truyền vào cả backend và frontend.

---

## 🚀 Cách chạy Docker

### Bước 1: Tìm IP máy tính
```powershell
ipconfig | Select-String "IPv4"
```
Chọn IP dạng `192.168.x.x` (cùng mạng WiFi với điện thoại)

### Bước 2: Tạo file `.env` từ template
```powershell
cd f:\Web\final\smart-restaurant
copy .env.docker.example .env
```

### Bước 3: Sửa file `.env` với IP và thông tin của bạn
```env
# Thay YOUR_IP bằng IP thực (ví dụ: 192.168.1.4)
CLIENT_BASE_URL=http://YOUR_IP:3000
NEXT_PUBLIC_API_URL=http://YOUR_IP:4000/api

# Thêm Google OAuth nếu cần
GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Thêm Email nếu cần
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Bước 4: Build và chạy
```powershell
# Build (lần đầu hoặc sau khi đổi IP)
docker-compose build --no-cache

# Khởi động
docker-compose up -d

# Kiểm tra
docker-compose ps
```

---

## 🔄 Khi đổi mạng WiFi (đổi IP)

1. Tìm IP mới: `ipconfig | Select-String "IPv4"`
2. Sửa file `.env` → `CLIENT_BASE_URL` và `NEXT_PUBLIC_API_URL`
3. Rebuild:
   ```powershell
   docker-compose build --no-cache
   docker-compose up -d
   ```

---

## 📋 Các lệnh thường dùng

| Lệnh | Mô tả |
|------|-------|
| `docker-compose up -d` | Khởi động |
| `docker-compose down` | Dừng |
| `docker-compose logs -f` | Xem logs |
| `docker-compose build --no-cache` | Build lại |
| `docker-compose down -v` | Xóa hoàn toàn (cả DB) |

---

## 👤 Tài khoản test

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@restaurant.com | 123456 |
| Waiter | waiter@restaurant.com | 123456 |
| Kitchen | kitchen@restaurant.com | 123456 |
| Guest | guest1@example.com | 123456 |

---

## 🔗 Truy cập

| Service | URL |
|---------|-----|
| Frontend | http://YOUR_IP:3000 |
| Backend API | http://YOUR_IP:4000/api |

---

## 🌐 Deploy lên Production

Sửa file `.env`:
```env
CLIENT_BASE_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
```
→ **Không cần update IP nữa!**

---

## 🔧 Troubleshooting

### Xem database
```powershell
docker exec -it smart-restaurant-db psql -U postgres -d smart_restaurant
\dt          # Liệt kê tables
\q           # Thoát
```

### Reset hoàn toàn
```powershell
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Firewall chặn port
```powershell
# Chạy với quyền Admin
netsh advfirewall firewall add rule name="Docker 3000" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Docker 4000" dir=in action=allow protocol=TCP localport=4000
```
