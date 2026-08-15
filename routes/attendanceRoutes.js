const express = require('express');
const router = express.Router();
const db = require('../database');
const { checkAuth } = require('../middleware/authMiddleware');
const { sendToAdmins } = require('../services/zaloService');
const { renderTableRows } = require('../views/dashboardView');

// ENDPOINT: API Xóa Toàn bộ dữ liệu từ Web Dashboard
router.post('/api/attendances/clean', checkAuth, async (req, res) => {
  if (req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Permission denied' });
  const count = await db.deleteAllAttendances();
  await sendToAdmins(`🧹 [WEB DASHBOARD] Đã dọn dẹp hệ thống. Xóa thành công ${count} lượt chấm công.`);
  return res.json({ success: true, deletedCount: count });
});

// ENDPOINT: API Lấy dữ liệu bảng Real-time
router.get('/api/attendances/rows', checkAuth, async (req, res) => {
  const html = await renderTableRows();
  return res.json({ success: true, html: html });
});

// ENDPOINT: API Sửa giờ chấm công
router.post('/api/attendances/edit', checkAuth, async (req, res) => {
  if (req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Permission denied' });
  const { id, checkIn, checkOut, checkInOT, checkOutOT, note } = req.body;
  if (!note || note.trim() === '') {
    return res.status(400).json({ error: 'Ghi chú / Giải trình là bắt buộc!' });
  }

  // Get the existing record to know the date
  const attendances = await db.getAllAttendances();
  const record = attendances.find(r => r.id === parseInt(id));
  if (!record) return res.status(404).json({ error: 'Không tìm thấy bản ghi' });

  const dateParts = record.date.split('-'); // YYYY-MM-DD
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1; // 0-indexed
  const day = parseInt(dateParts[2]);

  let checkInTs = undefined;
  if (checkIn) {
    const inParts = checkIn.split(':');
    checkInTs = new Date(year, month, day, parseInt(inParts[0]), parseInt(inParts[1])).getTime();
  }

  let checkOutTs = undefined;
  if (checkOut) {
    const outParts = checkOut.split(':');
    checkOutTs = new Date(year, month, day, parseInt(outParts[0]), parseInt(outParts[1])).getTime();
  }

  let checkInOT_Ts = undefined;
  if (checkInOT) {
    const inOTParts = checkInOT.split(':');
    checkInOT_Ts = new Date(year, month, day, parseInt(inOTParts[0]), parseInt(inOTParts[1])).getTime();
  }

  let checkOutOT_Ts = undefined;
  if (checkOutOT) {
    const outOTParts = checkOutOT.split(':');
    checkOutOT_Ts = new Date(year, month, day, parseInt(outOTParts[0]), parseInt(outOTParts[1])).getTime();
  }

  const success = await db.updateAttendance(id, checkInTs, checkOutTs, checkInOT_Ts, checkOutOT_Ts, note.trim());
  if (success) {
    return res.json({ success: true });
  } else {
    return res.status(500).json({ error: 'Lỗi cập nhật CSDL' });
  }
});

module.exports = router;
