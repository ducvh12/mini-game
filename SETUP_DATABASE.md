# Hướng dẫn Setup PostgreSQL

## 1. Cài đặt PostgreSQL

### Windows:
1. Download PostgreSQL từ: https://www.postgresql.org/download/windows/
2. Chạy installer và làm theo hướng dẫn
3. Ghi nhớ password của user `postgres`
4. Mặc định port: `5432`

### macOS (với Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## 2. Tạo Database

### Option 1: Sử dụng pgAdmin (GUI)
1. Mở pgAdmin
2. Tạo database mới tên `wheel_minigame`

### Option 2: Sử dụng psql (CLI)
```bash
# Login vào PostgreSQL
psql -U postgres

# Tạo database
CREATE DATABASE wheel_minigame;

# Thoát
\q
```

### Option 3: Sử dụng PowerShell
```powershell
# Tạo database
psql -U postgres -c "CREATE DATABASE wheel_minigame;"
```

## 3. Cấu hình Connection String

Mở file `.env` và cập nhật:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Ví dụ:
```env
# Local development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wheel_minigame?schema=public"

# Docker
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wheel_minigame?schema=public"

# Cloud (ví dụ Supabase/Neon)
DATABASE_URL="postgresql://user:password@db.xxx.supabase.co:5432/postgres"
```

## 4. Chạy Migration

```bash
# Generate Prisma Client và push schema
npm run db:push

# Seed dữ liệu mẫu
npm run db:seed
```

## 5. Kiểm tra Database

```bash
# Mở Prisma Studio để xem dữ liệu
npm run db:studio
```

## Sử dụng Docker (Optional)

Nếu không muốn cài PostgreSQL, có thể dùng Docker:

```bash
# Tạo file docker-compose.yml
docker-compose up -d
```

File `docker-compose.yml`:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: wheel_minigame
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Cloud Database (Khuyến nghị cho Production)

### Supabase (Free tier)
1. Đăng ký tại: https://supabase.com
2. Tạo project mới
3. Copy connection string từ Settings → Database
4. Paste vào `.env`

### Neon (Free tier)
1. Đăng ký tại: https://neon.tech
2. Tạo project mới
3. Copy connection string
4. Paste vào `.env`

### Railway
1. Đăng ký tại: https://railway.app
2. New Project → Provision PostgreSQL
3. Copy connection string
4. Paste vào `.env`

## Troubleshooting

### Lỗi: "Connection refused"
- Kiểm tra PostgreSQL đã chạy chưa
- Windows: Services → PostgreSQL
- Mac/Linux: `sudo systemctl status postgresql`

### Lỗi: "Authentication failed"
- Kiểm tra username/password trong `.env`
- Reset password PostgreSQL nếu cần

### Lỗi: "Database does not exist"
- Tạo database theo bước 2

## Ưu điểm PostgreSQL vs SQLite

✅ **Hiệu năng tốt hơn** với nhiều concurrent users
✅ **Lưu trữ tốt hơn** cho lịch sử lâu dài
✅ **Tính năng mạnh mẽ**: JSON, Full-text search, Window functions
✅ **Backup dễ dàng**: pg_dump, automated backups
✅ **Phù hợp production**: Scalable, reliable
✅ **Hỗ trợ indexes tốt**: Faster queries
