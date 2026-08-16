const express = require('express');
const router = express.Router();
const db = require('../database');
const { WEBHOOK_SECRET_TOKEN, BOT_NAME, PUBLIC_URL } = require('../config/constants');
const { sendZaloMessage, isAdmin } = require('../services/zaloService');

// Zalo webhook verification (GET)
router.get('/webhook', (req, res) => {
  console.log('Zalo verification GET request received:', req.query);
  res.status(200).json({ status: 'ok' });
});

// Webhook endpoint (POST)
router.post('/webhook', async (req, res) => {
  const secretToken = req.headers["x-bot-api-secret-token"];
  
  if (secretToken !== WEBHOOK_SECRET_TOKEN) {
    console.warn("Unauthorized webhook attempt - token mismatch");
    return res.status(403).json({ message: "Unauthorized" });
  }

  const payload = req.body;
  // Send 200 OK early to acknowledge receipt
  res.json({ message: "Success" });

  const result = payload?.result;
  const eventName = result?.event_name || payload?.event_name;
  const message = result?.message || payload?.message;

  if (message) {
    const text = message.text || '';
    let botMention = '@bot';
    const mentionMatch = text.match(/@[^\s]+/);
    if (mentionMatch) {
      botMention = mentionMatch[0];
    }
    
    let cleanTextForCmd = text.replace(new RegExp(`@?${BOT_NAME}`, 'gi'), '').replace(/@?Bot/gi, '').trim();
    cleanTextForCmd = cleanTextForCmd.replace(/^@\s*/, '').replace(/@\s*$/, '').trim();
    
    const sender = message.from || {};
    const chat = message.chat || {};
    const senderId = sender.id;
    const chatId = chat.id || senderId; 
    const chatName = chat.title || (chatId !== senderId ? 'Nhóm' : 'Cá nhân');
    const timestamp = parseInt(message.date) || Date.now();
    const dateObj = new Date(timestamp);

    // Format time
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const dateStr = `${day}/${month}/${year}`;



    const isAdminUser = await isAdmin(senderId);

    // Xử lý Lệnh đăng ký nhân viên: @bot /reg [Họ tên]
    if (cleanTextForCmd.startsWith('/reg ')) {
      const fullName = cleanTextForCmd.replace('/reg ', '').trim();
      if (!fullName) {
        await sendZaloMessage(chatId, `⚠️ Vui lòng nhập họ tên hợp lệ. VD: ${botMention} /reg Nguyễn Văn A`);
        return;
      }
      await db.registerEmployee(senderId, fullName);
      const msg = `✅ Đăng ký thành công! Xin chào ${fullName}.
📖 HƯỚNG DẪN SỬ DỤNG:
- Gõ ${botMention} (lần 1): Chấm VÀO
- Gõ ${botMention} (lần 2): Chấm RA
- Gõ ${botMention} /check: Xem trạng thái hôm nay
- Gõ ${botMention} /tangca (lần 1): Chấm VÀO ca tăng ca
- Gõ ${botMention} /tangca (lần 2): Chấm RA ca tăng ca`;
      await sendZaloMessage(chatId, msg);
      return;
    }

    // Lệnh /check
    if (text.trim() === '/check') {
      const employeeName = await db.getEmployee(senderId);
      if (!employeeName) {
        await sendZaloMessage(chatId, `⚠️ Bạn chưa đăng ký. Vui lòng gõ: ${botMention} /reg [Họ và Tên của bạn]`);
        return;
      }
      const record = await db.getAttendanceByDate(senderId, timestamp);
      if (!record) {
        await sendZaloMessage(chatId, `ℹ️ Trạng thái hôm nay: CHƯA CHẤM CÔNG.`);
        return;
      }
      let msg = "";
      if (!record.check_out_time) {
        const d = new Date(record.check_in_time);
        msg += `ℹ️ Ca chính: ĐÃ CHẤM VÀO lúc ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}. CHƯA CHẤM RA.\n`;
      } else {
        const dout = new Date(record.check_out_time);
        msg += `ℹ️ Ca chính: ĐÃ CHẤM RA lúc ${dout.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}.\n`;
      }
      
      if (record.overtime_in_time) {
        const dOT = new Date(record.overtime_in_time);
        msg += `Ca phụ: ĐÃ CHẤM VÀO lúc ${dOT.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}. `;
        if (record.overtime_out_time) {
          const doutOT = new Date(record.overtime_out_time);
          msg += `ĐÃ CHẤM RA lúc ${doutOT.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}.`;
        } else {
          msg += `CHƯA CHẤM RA.`;
        }
      }
      await sendZaloMessage(chatId, msg.trim());
      return;
    }

    // Lệnh /tangca
    if (cleanTextForCmd === '/tangca') {
      const employeeName = await db.getEmployee(senderId);
      if (!employeeName) {
        await sendZaloMessage(chatId, `⚠️ Bạn chưa đăng ký. Vui lòng gõ: ${botMention} /reg [Họ và Tên của bạn]`);
        return;
      }
      const { record, status } = await db.setOvertime(senderId, timestamp);
      if (status === 'no_main_shift') {
        await sendZaloMessage(chatId, `⚠️ Bạn chưa chấm vào ca chính hôm nay nên không thể chấm tăng ca. Vui lòng chấm vào trước!`);
      } else if (status === 'in_ot') {
        const d = new Date(record.overtime_in_time);
        await sendZaloMessage(chatId, `✅ CHẤM VÀO TĂNG CA THÀNH CÔNG lúc ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}.`);
      } else if (status === 'out_ot') {
        const d = new Date(record.overtime_out_time);
        await sendZaloMessage(chatId, `✅ CHẤM RA TĂNG CA THÀNH CÔNG lúc ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}.`);
      } else if (status === 'already_out_ot') {
        await sendZaloMessage(chatId, `⚠️ Hôm nay bạn đã hoàn thành ca tăng ca rồi. Không thể chấm lại!`);
      }
      return;
    }

    if (text.trim() === '/install') {
      const currentAdmin = await db.getSetting('admin_chat_id');
      if (currentAdmin) {
        await sendZaloMessage(chatId, "⚠️ Hệ thống đã có người quản trị Zalo. Vui lòng dùng lệnh /uninstall từ tài khoản cũ trước khi cài đặt mới.");
      } else {
        await db.setSetting('admin_chat_id', senderId);
        await sendZaloMessage(chatId, "✅ Cài đặt thành công! Bạn hiện là Quản trị viên Zalo của hệ thống.");
      }
      return;
    }

    if (text.trim() === '/uninstall') {
      const currentAdmin = await db.getSetting('admin_chat_id');
      if (currentAdmin === senderId) {
        await db.setSetting('admin_chat_id', null);
        await sendZaloMessage(chatId, "✅ Đã gỡ quyền Quản trị viên Zalo của bạn.");
      } else {
        await sendZaloMessage(chatId, "⚠️ Bạn không phải là Quản trị viên Zalo hiện tại của hệ thống này.");
      }
      return;
    }

    if (text.trim() === '/report') {
      if (!isAdminUser) return;
      const reportLink = `${PUBLIC_URL}/report`;
      await sendZaloMessage(chatId, `✅ Bảng quản trị của bạn tại:\n${reportLink}`);
      return;
    }

    // Handle bot mention (CHẤM CÔNG)
    if (text.includes(BOT_NAME) || text.includes('@Bot') || text.includes('@bot')) {
      // Bỏ qua nếu đây là lệnh /reg (đã xử lý ở trên)
      if (cleanTextForCmd.startsWith('/reg')) return;

      // Tìm nhân viên trong DB
      const employeeName = await db.getEmployee(senderId);
      if (!employeeName) {
        await sendZaloMessage(chatId, `⚠️ Bạn chưa đăng ký thông tin. Vui lòng gõ: ${botMention} /reg [Họ và Tên của bạn]`);
        return;
      }

      const location = "Zalo";
      const { record, status } = await db.recordAttendance(timestamp, senderId, employeeName, chatId, chatName, location);

      if (status === 'already_out') {
        await sendZaloMessage(chatId, `⚠️ Hôm nay bạn đã chấm ra rồi. Mỗi ngày chỉ được chấm vào/ra 1 lần!`);
        return;
      }

      let userMessage = "";
      if (status === 'in') {
        userMessage = `✅ CHẤM VÀO THÀNH CÔNG!
------------------------------
👤 Nhân viên: ${employeeName}
🕒 Giờ vào: ${timeStr} - ${dateStr}
------------------------------
😊 Chúc bạn một ngày làm việc hiệu quả!`;
      } else {
        userMessage = `✅ CHẤM RA THÀNH CÔNG!
------------------------------
👤 Nhân viên: ${employeeName}
🕒 Giờ ra: ${timeStr} - ${dateStr}
------------------------------
😊 Cảm ơn bạn đã điểm danh!`;
      }
        
      await sendZaloMessage(chatId, userMessage);
    }
  }
});

module.exports = router;
