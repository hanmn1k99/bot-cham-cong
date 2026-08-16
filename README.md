<div align="center">
  
# 🕒 Bot Chấm Công Zalo (Ca Chính & Tăng Ca)

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
![Node](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen.svg)
![Zalo API](https://img.shields.io/badge/Zalo%20API-v2.0-0068ff.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
[![Author](https://img.shields.io/badge/author-Nguy%E1%BB%85n_Minh_H%C3%A2n-ff69b4.svg)](https://minhhan.net)

Hệ thống Bot Zalo Chấm Công tích hợp tính lương theo giờ dành cho quán Cafe, Nhà hàng, Cửa hàng tiện lợi. Quản lý điểm danh nhân viên ngay trên nền tảng Zalo với Dashboard Web quản trị hiện đại.

[Tính Năng](#-tính-năng-nổi-bật) • [Cài Đặt](#-hướng-dẫn-cài-đặt) • [Sử Dụng](#-danh-sách-lệnh) • [Quản Trị](#-quản-trị-web-dashboard)

</div>

---

## 🚀 Tính Năng Nổi Bật

### 🧑‍💼 Trải Nghiệm Nhân Viên (Zalo Bot)
- **⚡ Chấm Công Nhanh Chóng**: Gõ lệnh trực tiếp trong nhóm hoặc nhắn tin riêng cho Bot.
- **🕒 Hỗ Trợ Đa Ca**: Phân biệt rõ ràng **Ca Chính** và **Ca Phụ (Tăng ca)** trong cùng một ngày.
- **🛡️ Chống Gian Lận**: Chỉ cho phép check-in và check-out 1 lần duy nhất cho mỗi ca trong ngày.
- **🤖 Thông Minh**: Tự động trích xuất tên gọi của Bot (ví dụ: `@BotCafe`, `@Chấm_Công`) để hướng dẫn nhân viên cực kỳ tự nhiên.
- **📝 Kiểm Tra Trạng Thái**: Nhân viên có thể tự tra cứu xem hôm nay mình đã chấm công lúc mấy giờ bằng lệnh `/check`.

### 👑 Trải Nghiệm Quản Lý (Web Dashboard)
- **📊 Bảng Điều Khiển Tinh Gọn**: Giao diện báo cáo Dark/Light mode trực quan, không dư thừa.
- **🧮 Tự Động Tính Lương**: Hệ thống tự động tính **Tổng số giờ làm** của từng nhân viên (Ca chính + Tăng ca) từ đầu tháng tới thời điểm hiện tại.
- **🖨️ Chế Độ In Báo Cáo**: Ẩn các nút bấm không cần thiết, tự động tối ưu hóa hiển thị để in báo cáo tính lương chỉ với 1 cú click.
- **✏️ Chỉnh Sửa Phân Quyền**: Admin có thể can thiệp sửa giờ vào/ra (Bắt buộc kèm Ghi chú/Giải trình).
- **🧹 Tự Động Dọn Dẹp**: Cronjob thông minh tự động xóa dữ liệu điểm danh cũ hơn 3 tháng vào ngày mùng 1 hàng tháng để tiết kiệm bộ nhớ.

---

## 💻 Danh Sách Lệnh (Zalo Commands)

> **Lưu ý:** Thay `@TênBot` bằng tên thật của Bot khi tag trong nhóm Zalo.

| Lệnh | Phân quyền | Mô tả |
| :--- | :---: | :--- |
| `@TênBot /reg [Họ Tên]` | `Nhân viên` | Đăng ký tài khoản hệ thống (Nhận diện theo Zalo ID) |
| `@TênBot` (Lần 1) | `Nhân viên` | Chấm **VÀO** Ca Chính |
| `@TênBot` (Lần 2) | `Nhân viên` | Chấm **RA** Ca Chính |
| `@TênBot /tangca` (Lần 1) | `Nhân viên` | Chấm **VÀO** Ca Phụ / Tăng ca |
| `@TênBot /tangca` (Lần 2) | `Nhân viên` | Chấm **RA** Ca Phụ / Tăng ca |
| `@TênBot /check` | `Nhân viên` | Xem lại trạng thái điểm danh ngày hôm nay của bản thân |
| `/report` | `Admin Zalo` | Lấy đường dẫn truy cập Web Dashboard quản trị |

---

## ⚙️ Hướng Dẫn Cài Đặt

### 1. Yêu Cầu Môi Trường
- Server chạy **Node.js** (phiên bản `v18.0.0` trở lên).
- Tài khoản **Zalo Official Account** và **Zalo Developer App** đã cấu hình Webhook.

### 2. Triển Khai Mã Nguồn
Clone repository về máy chủ của bạn và cài đặt các gói phụ thuộc (Dependencies):

```bash
git clone https://github.com/hanmn1k99/bot-cham-cong.git
cd bot-cham-cong
npm install
```

### 3. Cấu Hình Biến Môi Trường (`.env`)
Tạo một file `.env` tại thư mục gốc của dự án. File này cực kỳ quan trọng và **KHÔNG BAO GIỜ** được push lên GitHub:

```env
# ==========================================
# ZALO OA BOT CONFIGURATION
# ==========================================
BOT_TOKEN=your_zalo_bot_token_here
WEBHOOK_SECRET_TOKEN=your_zalo_webhook_secret_here
BOT_NAME=Tên Bot Của Bạn
ADMIN_CHAT_ID=zalo_id_cua_admin_de_nhan_bao_cao

# ==========================================
# SYSTEM CONFIGURATION
# ==========================================
PORT=3000
PUBLIC_URL=https://your-domain.com

# ==========================================
# SECURITY CONFIGURATION
# ==========================================
JWT_SECRET=your_super_secret_jwt_key_here
```
> 💡 *Mẹo: `ADMIN_CHAT_ID` là User ID của bạn trên Zalo để bot gửi tin nhắn nhắc nhở dọn dẹp hệ thống mỗi tháng.*

### 4. Khởi Chạy Hệ Thống

**Môi trường Phát triển (Development):**
```bash
npm run dev
```

**Môi trường Thực tế (Production):**
Sử dụng PM2 để chạy ngầm và giữ cho bot luôn hoạt động:
```bash
npm install -g pm2
pm2 start index.js --name "bot-cham-cong"
```

---

## 🔒 Quản Trị Web (Dashboard)

Hệ thống được trang bị Web Dashboard độc lập để quản lý dễ dàng hơn.

1. **Khởi tạo (Chạy lần đầu):** Truy cập `https://your-domain.com/setup` để thiết lập tài khoản **Super Admin**. Hệ thống sẽ cấp một *Recovery Key* để bạn lấy lại mật khẩu khi cần thiết.
2. **Đăng nhập:** Truy cập `https://your-domain.com/login`.
3. **Quản lý điểm danh:** Xem, lọc, in báo cáo và tính tổng giờ làm tại `https://your-domain.com/report`.

---

## 👨‍💻 Tác giả

**Nguyễn Minh Hân**  
- Website: [minhhan.net](https://minhhan.net)  
- Github: [@hanmn1k99](https://github.com/hanmn1k99)

---
<div align="center">
  <i>Được phát triển với ❤️ dành riêng cho quản lý đội ngũ linh hoạt.</i>
</div>
