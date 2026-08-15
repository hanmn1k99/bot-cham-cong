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
- Tài khoản Zalo Official Account (Zalo OA) đã được duyệt và tạo ứng dụng trên Zalo Developers.

### 2. Cài đặt mã nguồn
```bash
# Cài đặt thư viện
npm install
```

### 3. Cấu hình biến môi trường (.env)
Tạo file `.env` tại thư mục gốc của dự án và điền các thông tin sau:

```env
# Port chạy ứng dụng (Mặc định: 3000)
PORT=3000

# Mật khẩu để đăng nhập vào Web Dashboard Quản trị (Thay đổi thành mật khẩu của bạn)
WEB_PASSWORD=admin12345

# URL Public của bạn (Dùng ngrok khi test local, hoặc domain thật khi chạy Production)
PUBLIC_URL=https://your-domain.com

# --- ZALO OA CONFIGURATION ---
# Lấy từ Zalo Developers > Ứng dụng của bạn
ZALO_APP_ID=1234567890123456789
ZALO_APP_SECRET=your_app_secret_here

# Lấy từ tài khoản Zalo OA > Quản lý liên kết ứng dụng
ZALO_OA_ID=1234567890123456789
ZALO_ACCESS_TOKEN=your_oa_access_token_here
ZALO_REFRESH_TOKEN=your_oa_refresh_token_here

# Token bạn tự đặt để Zalo xác thực Webhook
WEBHOOK_SECRET_TOKEN=my_secret_token_123

# ID Zalo của người quản trị (Sẽ nhận thông báo hệ thống)
ADMIN_CHAT_ID=1111222233334444555
```

> **Lưu ý**: File `.env` chứa thông tin nhạy cảm (Token, Mật khẩu), **tuyệt đối không** push file này lên GitHub (đã được cấu hình trong `.gitignore`).

### 4. Khởi chạy
```bash
# Chạy ở chế độ phát triển
npm run dev

# Hoặc chạy Production
npm start
```
Hệ thống sẽ chạy trên `http://localhost:3000`. Hãy thiết lập Webhook trên Zalo Developers trỏ về `https://your-domain.com/webhook` (nhớ truyền Secret Token).

## Hướng dẫn cho Admin (Web Dashboard)
1. Truy cập `https://your-domain.com` trên trình duyệt.
2. Đăng nhập bằng tài khoản Quản trị với mật khẩu đã đặt ở `WEB_PASSWORD`.
3. Bảng điều khiển sẽ hiển thị các bản ghi điểm danh (Vào / Ra) của 2 ca.
4. Có thể nhấn vào biểu tượng ✏️ ở cột "Sửa" để điều chỉnh giờ. Quá trình này **bắt buộc** phải điền Ghi chú/Giải trình.

## Cơ sở dữ liệu
Hệ thống lưu trữ dữ liệu dưới dạng Local JSON file (`database.json`) để đảm bảo tính nhẹ gọn, dễ triển khai mà không cần cài đặt MySQL/MongoDB. File này cũng được tự động bỏ qua khi push code lên Git.
