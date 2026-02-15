# Quay Lì Xì Tết 2026

Website mini-game quay lì xì may mắn cho dịp Tết Nguyên Đán 2026.

## Tính năng

- 🎰 **Quay lì xì ngẫu nhiên** với nhiều phần thưởng khác nhau
- 🎉 **Hiệu ứng Tết** với animation đẹp mắt
- 🎊 **Confetti** khi trúng thưởng lớn
- 🏆 **Bảng vàng may mắn** hiển thị 10 lượt quay gần nhất
- 🔒 **Anti-spam** với giới hạn lượt chơi theo IP và thiết bị
- ⏱️ **Cooldown** giữa các lần quay
- 👤 **Session management** đơn giản không cần đăng nhập
- 📊 **Admin dashboard** để quản lý phần thưởng và xem thống kê

## Cài đặt

1. **Clone repository và cài đặt dependencies:**

```bash
cd wheel-minigame
npm install
```

2. **Setup PostgreSQL Database:**

**Option A: Sử dụng Docker (Khuyến nghị - Dễ nhất)**
```bash
docker-compose up -d
```

**Option B: Cài PostgreSQL thủ công**
- Xem hướng dẫn chi tiết trong [SETUP_DATABASE.md](SETUP_DATABASE.md)
- Tạo database `wheel_minigame`
- Cập nhật connection string trong `.env`

3. **Migrate và Seed database:**

```bash
npm run db:push
npm run db:seed
```

4. **Chạy development server:**

```bash
npm run dev
```

5. **Mở trình duyệt:**

```
http://localhost:3000
```

## Truy cập Admin

- URL: `http://localhost:3000/admin`
- Mật khẩu mặc định: `admin123` (có thể thay đổi trong file `.env`)

## Cấu trúc dự án

```
wheel-minigame/
├── app/
│   ├── api/              # API routes
│   │   ├── session/      # Quản lý session người chơi
│   │   ├── spin/         # Xử lý quay lì xì
│   │   ├── recent-spins/ # Lấy danh sách quay gần nhất
│   │   └── admin/        # API admin (stats, rewards)
│   ├── admin/            # Trang admin
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── lib/
│   ├── prisma.ts         # Prisma client
│   └── utils.ts          # Utility functions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.js           # Seed data
└── package.json
```

## Quy tắc chơi

- Mỗi người chơi có **3 lượt quay/ngày**
- Mỗi IP tối đa **30 lượt/ngày**
- Cooldown **10 giây** giữa các lần quay
- Phần thưởng được chọn ngẫu nhiên theo xác suất đã cấu hình

## Phần thưởng mặc định

| Phần thưởng | Giá trị | Xác suất | Giới hạn |
|------------|---------|----------|----------|
| 1K | 1.000đ | 30% | Không |
| 2K | 2.000đ | 25% | Không |
| 5K | 5.000đ | 20% | Không |
| 10K | 10.000đ | 15% | Không |
| 20K | 20.000đ | 7% | 100 |
| 50K | 50.000đ | 2% | 50 |
| JACKPOT | 100.000đ | 1% | 10 |

## Công nghệ sử dụng

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Prisma** - Database ORM
- **PostgreSQL** - Database (có thể dùng Supabase/Neon cho cloud)
- **Canvas Confetti** - Confetti effects

## Customization

### Thay đổi mật khẩu Admin

Sửa file `.env`:

```env
ADMIN_PASSWORD="your_new_password"
NEXT_PUBLIC_ADMIN_PASSWORD="your_new_password"
```

### Thay đổi quy tắc chơi

Vào Admin Dashboard → Stats → Cấu hình được lưu trong bảng `EventConfig`

### Thay đổi phần thưởng

Vào Admin Dashboard → Quản lý phần thưởng → Chỉnh sửa xác suất, số lượng, trạng thái

## Build cho Production

```bash
npm run build
npm start
```

## Database

- **PostgreSQL** - Production-ready database
- **Docker Compose** - Dễ dàng setup local
- **Cloud Options**: Supabase, Neon, Railway (Free tier available)
- Xem [SETUP_DATABASE.md](SETUP_DATABASE.md) để biết chi tiết

## Deploy

### Vercel + Supabase (Khuyến nghị)
1. Deploy code lên Vercel
2. Tạo database trên Supabase
3. Thêm `DATABASE_URL` vào Vercel Environment Variables
4. Deploy!

### Railway (All-in-one)
1. Connect GitHub repo
2. Add PostgreSQL service
3. Deploy!

## License

MIT

---

🧧 **Chúc mừng năm mới, vạn sự như ý!** 🧧
