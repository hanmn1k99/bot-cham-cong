<div align="center">
  
# 🕒 Bot Chấm Công Zalo (Ca Chính & Tăng Ca)

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg?style=for-the-badge&logo=github&logoColor=white)
![Node](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen.svg?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Zalo API](https://img.shields.io/badge/Zalo%20API-v2.0-0068ff.svg?style=for-the-badge&logo=zalo&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)
[![Author](https://img.shields.io/badge/Author-Nguy%E1%BB%85n_Minh_H%C3%A2n-000000.svg?style=for-the-badge&logo=github&logoColor=white)](https://minhhan.net)

Hệ thống Bot Zalo Chấm Công tích hợp tính lương theo giờ dành cho quán Cafe, Nhà hàng, Cửa hàng tiện lợi. Quản lý điểm danh nhân viên ngay trên nền tảng Zalo với Dashboard Web quản trị hiện đại.

[Tính Năng](#-tính-năng-nổi-bật) • [Cài Đặt](#-hướng-dẫn-cài-đặt) • [Sử Dụng](#-danh-sách-lệnh) • [Quản Trị](#-quản-trị-web-dashboard)

</div>

---

## 🚀 Tính Năng Nổi Bật

### 🧑‍💼 Trải Nghiệm Nhân Viên (Zalo Bot)
- **⚡ Chấm Công Nhanh Chóng**: Gõ lệnh trực tiếp trong nhóm hoặc nhắn tin riêng cho Bot.
- **🕒 Hỗ Trợ Đa Ca**: Phân biệt rõ ràng **Ca Chính** và **Ca Phụ (Tăng ca)** trong cùng một ngày.
- **🛡️ Chống Chấm Ra Sớm**: Hệ thống đối chiếu với lịch Excel. Nếu nhân viên về sớm hơn giờ kết thúc ca, Bot sẽ từ chối và bắt buộc nhân viên gõ lý do (VD: `@bot ra Khám bệnh`).
- **🤖 Thông Minh**: Tự động trích xuất tên gọi của Bot (ví dụ: `@BotCafe`, `@Chấm_Công`) để hướng dẫn nhân viên cực kỳ tự nhiên.

### 👑 Trải Nghiệm Quản Lý (Web Dashboard & Excel)
- **📅 Quản Lý Lịch Bằng Excel**: Tải file mẫu trực tiếp trên Web. Admin tự định nghĩa Khung Giờ Ca (Ví dụ: Ca 1: 06:00-12:00, Ca 2...) và gán ca cho nhân viên ngay trên Excel. Upload 1 phát là ăn ngay!
- **🚨 Cảnh Báo Tự Động (Group Zalo)**:
  - **Quên chấm vào:** Đúng 1 phút sau khi ca bắt đầu, Bot réo tên những ai chưa chấm công.
  - **Quên chấm ra:** Đúng 30 phút sau khi kết thúc ca, ai chưa về sẽ bị bêu tên.
  - **Nhắc nhở cập nhật lịch:** Đúng 19:00 Chủ Nhật nếu chưa có file Excel cho tuần mới, Admin sẽ bị nhắc nhở.
- **📊 Bảng Điều Khiển Tinh Gọn**: Giao diện báo cáo Dark/Light mode trực quan, lọc tổng số giờ làm theo tháng siêu chuẩn.
- **🧹 Tự Động Dọn Dẹp Cuốn Chiếu**: Chạy ngầm lúc `00:00` mỗi ngày để tự động xóa sạch các dữ liệu điểm danh cũ hơn 90 ngày (Cơ chế giống hệt đầu ghi Camera).
- **🖨️ Chế Độ In Báo Cáo**: Chỉ với 1 cú click, biến trang web thành bản báo cáo in giấy hoàn hảo để phát lương.
- **❌ Xóa Nhân Sự**: Quản lý và xóa vĩnh viễn hồ sơ những nhân viên đã nghỉ việc.

---

## 💻 Danh Sách Lệnh (Zalo Commands)

> **Lưu ý:** Thay `@TênBot` bằng tên thật của Bot khi tag trong nhóm Zalo.

| Lệnh | Phân quyền | Mô tả |
| :--- | :---: | :--- |
| `@TênBot /reg [Họ Tên]` | `Nhân viên` | Đăng ký tài khoản hệ thống (Nhận diện theo Zalo ID) |
| `@TênBot` (Lần 1) | `Nhân viên` | Chấm **VÀO** Ca Chính |
| `@TênBot` (Lần 2) | `Nhân viên` | Chấm **RA** Ca Chính (Sẽ bị chặn nếu về sớm) |
| `@TênBot ra [Lý do]` | `Nhân viên` | Chấm **RA** Sớm (Kèm theo lý do giải trình) |
| `@TênBot /tangca` (Lần 1) | `Nhân viên` | Chấm **VÀO** Ca Phụ / Tăng ca |
| `@TênBot /tangca` (Lần 2) | `Nhân viên` | Chấm **RA** Ca Phụ / Tăng ca |
| `@TênBot /check` | `Nhân viên` | Xem lại trạng thái điểm danh ngày hôm nay của bản thân |
| `/install` | `Quản lý` | Kích hoạt bản thân thành Admin Zalo (nhận báo cáo cá nhân) |
| `/uninstall` | `Quản lý` | Hủy quyền Admin Zalo hiện tại |
| `/setgroup` | `Quản lý` | (Gõ trong Nhóm) Đặt nhóm hiện tại làm Group nhận cảnh báo tự động |
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
> 💡 *Mẹo: Sau khi chạy hệ thống, hãy nhắn tin `/install` cho bot trên Zalo cá nhân để làm Admin. Sau đó mời bot vào nhóm công ty và gõ `/setgroup` để bật cảnh báo.*

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
3. **Các tính năng trên Dashboard:**
   - **Báo cáo (Report):** Xem tổng giờ làm, in ấn, sửa giờ vào/ra.
   - **Lịch Làm Việc (Schedule):** Tải Template Excel về máy. Sửa lại Cấu hình ca (nếu cần), điền mã ca cho từng nhân viên và Upload lên hệ thống.
   - **Nhân Viên (Employees):** Xem danh sách mã Zalo ID của nhân viên, xóa nhân sự khi có người nghỉ việc.

---

## 👨‍💻 Tác giả

**Nguyễn Minh Hân**  
- Website: [minhhan.net](https://minhhan.net)  
- Github: [@hanmn1k99](https://github.com/hanmn1k99)

---
<div align="center">
  <i>Được phát triển với ❤️ dành riêng cho quản lý đội ngũ linh hoạt.</i>
</div>
