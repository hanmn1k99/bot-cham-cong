# Bot Chấm Công Zalo (Ca Chính & Ca Phụ)

Hệ thống Bot Zalo Chấm Công tích hợp tính lương theo giờ dành cho quán Cafe, Cửa hàng. Hỗ trợ chấm ca chính, chấm tăng ca, xem báo cáo và quản lý thời gian trên giao diện Web.

## Tính năng chính

- **Chấm công linh hoạt**: Hỗ trợ 2 ca trong cùng 1 ngày (Ca Chính và Ca Phụ/Tăng ca).
- **Ngăn chặn Spam**: Chỉ cho phép 1 lần In và 1 lần Out cho mỗi ca mỗi ngày.
- **Tự động nhận diện Tên Bot**: Không cần cấu hình tên cứng, bot tự lấy tên mà nhân viên gọi để hướng dẫn.
- **Lệnh trực quan trên Zalo**:
  - `@TênBot /reg [Họ tên]`: Đăng ký nhân viên mới.
  - `@TênBot`: Chấm VÀO / RA ca chính.
  - `@TênBot /tangca`: Chấm VÀO / RA ca phụ.
  - `@TênBot /check`: Kiểm tra giờ vào/ra của cả 2 ca.
- **Web Dashboard**: Giao diện Quản trị viên cho phép theo dõi lịch sử chấm công, lọc theo ngày, và **Sửa giờ chấm công** (yêu cầu giải trình bắt buộc).

## Cài đặt hệ thống (Local & Production)

### 1. Yêu cầu hệ thống
- Node.js (phiên bản 18 trở lên).
- Zalo Official Account và Zalo Developer App.

### 2. Cài đặt mã nguồn
```bash
# Cài đặt thư viện
npm install
```

### 3. Cấu hình biến môi trường (.env)
Tạo file `.env` tại thư mục gốc của dự án và điền các thông tin sau:

```env
# Zalo OA Bot Configuration
BOT_TOKEN=your_zalo_bot_token_here
WEBHOOK_SECRET_TOKEN=ticket-bot-secret
BOT_NAME=Tên Bot Của Bạn
PORT=3000
PUBLIC_URL=https://your-domain.com

# AI API Configuration (Có thể bỏ trống vì Bot Chấm Công không còn dùng AI)
AI_API_KEY=

# Security Configuration
JWT_SECRET=your_super_secret_jwt_key_here
```

### 4. Khởi chạy
```bash
# Chạy ở chế độ phát triển
npm run dev

# Hoặc chạy Production
npm start
```
Hệ thống sẽ chạy trên `http://localhost:3000`. Đừng quên thiết lập Webhook trên Zalo Developers trỏ về `https://your-domain.com/webhook` (kèm theo Secret Token).

## Hướng dẫn cho Admin (Web Dashboard)
1. Truy cập `https://your-domain.com` trên trình duyệt.
2. Đăng nhập bằng tài khoản Quản trị. (Nếu chưa có tài khoản, hãy đăng ký lần đầu tại trang `/register` hoặc sử dụng tài khoản admin cũ).
3. Bảng điều khiển sẽ hiển thị các bản ghi điểm danh (Vào / Ra) của 2 ca.
4. Có thể nhấn vào biểu tượng ✏️ ở cột "Sửa" để điều chỉnh giờ. Quá trình này **bắt buộc** phải điền Ghi chú/Giải trình.
