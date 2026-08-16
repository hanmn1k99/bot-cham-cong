# Bot Chấm Công Zalo (Ca Chính & Ca Phụ)

Hệ thống Bot Zalo Chấm Công tích hợp tính lương theo giờ dành cho quán Cafe, Cửa hàng. Hỗ trợ chấm ca chính, chấm tăng ca và theo dõi qua giao diện Web Dashboard quản trị. Phiên bản cực kỳ tinh gọn, thiết kế chỉ để làm 1 việc duy nhất: Chấm công.

---

## 🚀 Các Tính Năng Nổi Bật

### 1. Dành cho Nhân viên
- **Đăng ký định danh**: Nhận diện nhân viên theo Zalo ID.
- **Chấm công 2 ca linh hoạt**: Hỗ trợ một phiên làm việc chính và một phiên tăng ca (Ca phụ) trong cùng một ngày.
- **Chống gian lận / Spam**: Mỗi ngày chỉ được phép check-in và check-out 1 lần cho mỗi ca.
- **Tự động nhận diện Tên Bot**: Bot sẽ tự động trích xuất tên gọi mà nhân viên dùng để tag (ví dụ: `@BotCafe`, `@Chấm_Công`) và sử dụng tên đó trong các thông báo hướng dẫn.

### 2. Dành cho Quản trị viên (Web Dashboard)
- **Thiết lập ban đầu bảo mật**: Cung cấp trang `/setup` để khởi tạo tài khoản Admin và sinh mã khôi phục (Recovery Key) cho lần truy cập đầu.
- **Khôi phục mật khẩu**: Trang `/forgot-password` cho phép đặt lại mật khẩu nếu có Recovery Key.
- **Báo cáo chi tiết**: Xem bảng chấm công hiển thị rõ ràng 4 mốc thời gian: Giờ Vào, Giờ Ra, Vào (TC), Ra (TC).
- **Chỉnh sửa giờ công**: Admin có quyền sửa lại giờ làm việc của nhân viên (bắt buộc phải điền Lý do/Giải trình).
- **Xóa CSDL**: Dọn dẹp toàn bộ dữ liệu chấm công an toàn qua Dashboard.

---

## 💻 Danh Sách Lệnh (Zalo Commands)

### Lệnh Tương Tác
- `@TênBot /reg [Họ Tên]`: Đăng ký tài khoản nhân viên mới.
- `@TênBot` (lần 1): Chấm **VÀO** ca chính.
- `@TênBot` (lần 2): Chấm **RA** ca chính.
- `@TênBot /tangca` (lần 1): Chấm **VÀO** ca phụ (tăng ca).
- `@TênBot /tangca` (lần 2): Chấm **RA** ca phụ (tăng ca).
- `@TênBot /check`: Xem trạng thái điểm danh hiện tại của bản thân.
- `/report`: (Chỉ Admin) Lấy đường dẫn truy cập Web Dashboard.

---

## ⚙️ Hướng Dẫn Cài Đặt

### 1. Yêu cầu hệ thống
- Node.js (phiên bản 18 trở lên).
- Zalo Official Account và Zalo Developer App.

### 2. Cài đặt mã nguồn
```bash
git clone https://github.com/hanmn1k99/bot-cham-cong.git
cd bot-cham-cong
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
ADMIN_CHAT_ID=zalo_id_cua_admin_de_nhan_bao_cao

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
Hệ thống sẽ chạy trên cổng `3000`. Đừng quên thiết lập Webhook trên Zalo Developers trỏ về `https://your-domain.com/webhook` (kèm theo Secret Token).

---

## 🔒 Quản Trị Web (Dashboard)
1. Trong lần đầu tiên khởi chạy ứng dụng, truy cập `https://your-domain.com/setup` để **Khởi tạo tài khoản Quản trị tối cao**.
2. Hệ thống sẽ cấp cho bạn một **Mã khôi phục (Recovery Key)**. Hãy lưu lại cẩn thận để dùng khi quên mật khẩu.
3. Đăng nhập tại `https://your-domain.com/login`.
4. Xem báo cáo chấm công tại `https://your-domain.com/report`.
