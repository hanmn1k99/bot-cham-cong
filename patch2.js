const fs = require('fs');

// 1. REWRITE routes/scheduleRoutes.js
const scheduleRoutesCode = `const express = require('express');
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
        const parsedData = { employees: {}, shifts: [] };
        
        // Đọc cấu hình ca
        const configSheetName = workbook.SheetNames.find(n => n === "Cấu Hình Ca" || n === "CauHinhCa");
        if (configSheetName) {
            const configData = xlsx.utils.sheet_to_json(workbook.Sheets[configSheetName]);
            for (const row of configData) {
                if (row['Mã Ca'] && row['Giờ Bắt Đầu'] && row['Giờ Kết Thúc']) {
                    parsedData.shifts.push({
                        id: parseInt(row['Mã Ca']),
                        name: row['Tên Ca'] || 'Ca ' + row['Mã Ca'],
                        start: row['Giờ Bắt Đầu'],
                        end: row['Giờ Kết Thúc']
                    });
                }
            }
        }
        if (parsedData.shifts.length === 0) {
            parsedData.shifts = db.getDefaultShifts();
        }

        // Đọc lịch làm việc
        const scheduleSheet = workbook.SheetNames[0]; // Tab đầu tiên
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[scheduleSheet]);
        const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
        
        for (const row of data) {
            const name = row['Họ Tên'];
            if (!name) continue;
            
            parsedData.employees[name] = {};
            for (const day of days) {
                const shiftVal = row[day];
                if (shiftVal) {
                    parsedData.employees[name][day] = parseInt(shiftVal);
                }
            }
        }
        
        // Upload cho tuần tới
        const nextWeekDate = new Date();
        nextWeekDate.setDate(nextWeekDate.getDate() + 7);
        const targetWeek = getYearWeek(nextWeekDate);
        
        await db.saveSchedule(targetWeek, parsedData);
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
    
    const wsConfigData = [
        ["Mã Ca", "Tên Ca", "Giờ Bắt Đầu", "Giờ Kết Thúc"],
        [1, "Ca Sáng", "06:00", "12:00"],
        [2, "Ca Chiều", "12:00", "18:00"],
        [3, "Ca Tối", "18:00", "24:00"]
    ];
    const wsConfig = xlsx.utils.aoa_to_sheet(wsConfigData);
    xlsx.utils.book_append_sheet(wb, wsConfig, "Cấu Hình Ca");
    
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename="template_lich_lam_viec.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
});

module.exports = router;
`;
fs.writeFileSync('routes/scheduleRoutes.js', scheduleRoutesCode, 'utf8');

// 2. PATCH webhookRoutes.js
let webhookCode = fs.readFileSync('routes/webhookRoutes.js', 'utf8');
webhookCode = webhookCode.replace(
    'const scheduleData = await db.getSchedule(yearWeek) || {};',
    "const scheduleData = await db.getSchedule(yearWeek) || {};\nconst employeesSchedule = scheduleData.employees || scheduleData;\nconst employeeSchedule = employeesSchedule[employeeName];\nconst shifts = scheduleData.shifts || db.getDefaultShifts();"
);
webhookCode = webhookCode.replace('const employeeSchedule = scheduleData[employeeName];', '');
webhookCode = webhookCode.replace('const shifts = db.getDefaultShifts();', '');
fs.writeFileSync('routes/webhookRoutes.js', webhookCode, 'utf8');

// 3. PATCH views/scheduleView.js
let scheduleViewCode = fs.readFileSync('views/scheduleView.js', 'utf8');
scheduleViewCode = scheduleViewCode.replace('const shifts = db.getDefaultShifts();', '');
scheduleViewCode = scheduleViewCode.replace(
    'const scheduleData = await db.getSchedule(currentWeek) || {};',
    "const scheduleData = await db.getSchedule(currentWeek) || { employees: {}, shifts: [] };\nconst employeesSchedule = scheduleData.employees || scheduleData;\nconst shifts = scheduleData.shifts && scheduleData.shifts.length ? scheduleData.shifts : db.getDefaultShifts();\nconst shiftText = shifts.map(s => s.name + ' (' + s.start + ' - ' + s.end + ')').join(' | ');"
);
scheduleViewCode = scheduleViewCode.replace(
    'for (const [empName, schedule] of Object.entries(scheduleData)) {',
    'for (const [empName, schedule] of Object.entries(employeesSchedule)) {'
);
scheduleViewCode = scheduleViewCode.replace(
    '<b>Quy ước ca mặc định:</b> Ca 1 (06:00 - 12:00) | Ca 2 (12:00 - 18:00) | Ca 3 (18:00 - 24:00)',
    '<b>Cấu hình ca tuần này:</b> ${shiftText}'
);
fs.writeFileSync('views/scheduleView.js', scheduleViewCode, 'utf8');

console.log('Patched API and Views');
