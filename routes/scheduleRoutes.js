const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const db = require('../database');
const { checkAuth } = require('../middleware/authMiddleware');
const { getScheduleHtml } = require('../views/scheduleView');

const upload = multer({ dest: 'uploads/' });

function getYearWeek(d) {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return date.getFullYear() + '-W' + String(weekNum).padStart(2, '0');
}

router.get('/schedule', checkAuth, async (req, res) => {
    const html = await getScheduleHtml(req.user);
    res.send(html);
});

router.post('/api/schedule/upload', checkAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        // Cấu trúc mong muốn: { "Nguyễn Văn A": { "Thứ 2": 1, "Thứ 3": 2... } }
        const parsedData = {};
        const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
        
        for (const row of data) {
            const name = row['Họ Tên'];
            if (!name) continue;
            
            parsedData[name] = {};
            for (const day of days) {
                const shiftVal = row[day];
                if (shiftVal) {
                    parsedData[name][day] = parseInt(shiftVal);
                }
            }
        }
        
        // Upload cho tuần tới (mặc định)
        const nextWeekDate = new Date();
        nextWeekDate.setDate(nextWeekDate.getDate() + 7); // Move to next week
        const targetWeek = getYearWeek(nextWeekDate);
        
        await db.saveSchedule(targetWeek, parsedData);
        
        // Xóa file tạm
        require('fs').unlinkSync(req.file.path);
        
        res.json({ success: true, parsedData });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Invalid excel format' });
    }
});

router.get('/api/schedule/template', checkAuth, (req, res) => {
    const wb = xlsx.utils.book_new();
    const wsData = [
        ["Họ Tên", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"],
        ["Nguyễn Văn A", 1, 1, 1, 2, 2, 3, ""],
        ["Trần Thị B", 2, 2, 3, 3, 1, 1, ""]
    ];
    const ws = xlsx.utils.aoa_to_sheet(wsData);
    xlsx.utils.book_append_sheet(wb, ws, "Lịch Làm Việc");
    
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename="template_lich_lam_viec.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
});

module.exports = router;
