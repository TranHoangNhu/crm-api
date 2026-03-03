# CRM API Backend

Đây là mã nguồn Backend API của dự án CRM, được xây dựng dựa trên framework [NestJS](https://nestjs.com/). API này đóng vai trò trung gian xử lý các tác vụ phức tạp, bảo mật nghiệp vụ và giao tiếp với cơ sở dữ liệu Supabase, phục vụ cho ứng dụng web CRM (Next.js).

## 🚀 Các tính năng cốt lõi (Core Modules)

Hệ thống được thiết kế theo cấu trúc module hoá (Modular Architecture), bao gồm các tính năng chính sau:

- **Auth Module**: Xử lý xác thực (Authentication) và phân quyền (Authorization) dựa vào Supabase JWT token. Đảm bảo an toàn cho các endpoint thông qua Guards.
- **Supabase Module**: Cung cấp `SupabaseService` sử dụng [Supabase Admin Client (Service Role Key)](https://supabase.com/docs/reference/javascript/admin-api) để bypass RLS (Row Level Security) khi cần thực hiện các tác vụ backend đặc quyền.
- **Quotes Module**: Quản lý tạo báo giá, lưu trữ các module báo giá và cập nhật trạng thái báo giá một cách nhất quán.
- **Contracts Module**: Dựa trên báo giá (Quote) đã chốt để tự động sinh ra hợp đồng (Contract), các giai đoạn thanh toán (Payment Phases), và theo dõi công nợ, tiến độ dự án.
- **Email Module**: Xử lý gửi email tự động (như gửi báo giá cho khách hàng) sử dụng Resend hoặc các dịch vụ SMTP tích hợp sẵn.
- **PDF Module**: Chứa logic tạo file PDF tự động (từ Hợp đồng, Báo giá) sử dụng Puppeteer/Playwright hoặc các thư viện buffer để khách hàng và admin tải xuống/in ấn trực tiếp.
- **Delivery Module**: Quản lý quy trình bàn giao dự án, timeline, task và upload tài liệu, thiết kế.
- **Health Check (`/health`)**: API Ping hệ thống với truy vấn cực nhẹ tới Supabase. Endpoint này được kết nối với [cron-job.org](https://cron-job.org) để tối ưu hoá, tránh trạng thái "Cold Start" (ngủ đông) trên nền tảng Serverless (Vercel) và tự động tạm ngưng phiên Database Supabase do inactivity.

## 🛠️ Tech Stack (Công nghệ sử dụng)

- **Framework**: [NestJS v10](https://nestjs.com/)
- **Language**: TypeScript
- **BaaS (Database & Auth)**: [Supabase](https://supabase.com/)
- **Deployment**: Hoạt động tối ưu trên [Vercel Serverless Functions](https://vercel.com/) tĩnh thông qua file `serverless.ts` và `vercel.json` (hoặc PM2 với `ecosystem.config.js` nếu host trên VPS).

## 🗂 Cấu trúc thư mục

```text
src/
├── app.module.ts            # Móc nối (root module) của toàn bộ ứng dụng
├── main.ts                  # Entry point cho dev/VPS (chạy qua cổng 3002)
├── serverless.ts            # Entry point cho triển khai Vercel Serverless
├── setup.ts                 # File cấu hình chung (CORS, ValidationPipe, Prefix)
├── health.controller.ts     # Healthcheck endpoint
├── common/                  # Thư mục chứa guards, decorators và Supabase clients
│   └── supabase/
│       └── supabase.service.ts
└── modules/                 # Các domain module (Auth, Contracts, Quotes, PDF, Email, Delivery)
```

## ⚙️ Cài đặt & Chạy trên môi trường Local

**1. Clone dự án và cài đặt package**

```bash
git clone https://github.com/TranHoangNhu/crm-api.git
cd crm-api
npm install
```

**2. Thiết lập biến môi trường**
Copy file `.env.example` thành `.env` và điền đầy đủ các thông số thực tế:

```bash
cp .env.example .env
```

Các biến quan trọng gồm:

- `PORT` (Mặc định 3002)
- `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` (Lấy từ Supabase Dashboard)
- Các biến API Key cho Resend/Email (nếu có)

**3. Khởi động ứng dụng**

```bash
# Chạy ở chế độ development (có hot-reload)
npm run start:dev

# Build & Chạy ở chế độ production
npm run build
npm run start:prod
```

Server sẽ mặc định chạy tại: `http://localhost:3002/api/v1`

## ☁️ Deployment (Triển khai lên Vercel)

Dự án đã được config sẵn sàng để deploy lên Vercel dạng Serverless Functions qua file cấu hình `vercel.json` và `src/serverless.ts`.

1. Khởi tạo / Liên kết project trên Vercel.
2. Tại màn hình Dashboard Vercel, cài đặt biến môi trường tương ứng trong tab **Settings > Environment Variables**.
3. Push code lên nhánh `main`, Vercel sẽ tự động build và deploy backend API.

**Cảnh báo ngủ đông (Cold Start):**
Các tài khoản Vercel/Supabase gói miễn phí sẽ có cơ chế tạm ngưng (Pause) nếu không có truy cập. Dự án này sử dụng _Cronjob_ (đã cấu hình chọc vào api `/api/v1/health` mỗi 14 phút/lần) để giữ ứng dụng luôn sẵn sàng phục vụ nhanh nhất (Warm).

## 🤝 Contributing & Maintenance

Vì hệ thống tuân theo Design Pattern của NestJS, mọi Module mới được tạo ra nên được đặt trong thư mục `src/modules/` và đăng ký vào `app.module.ts`. Giữ cho API Controllers sạch sẽ và đẩy các logic xử lý phức tạp vào `Services`.

---

_Trân trọng cảm ơn!_
