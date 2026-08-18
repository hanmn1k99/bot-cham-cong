const fs = require('fs');

const cronCode = `const cron = require('node-cron');
const db = require('./database');
const { sendZaloMessage } = require('./services/zaloService');

function getYearWeek(d) {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return date.getFullYear() + '-W' + String(weekNum).padStart(2, '0');
}

function setupCronJobs(sendToAdmins) {
  // 1. Quên chấm vào (Check mỗi 5 phút)
  cron.schedule('*/5 * * * *', async () => {
    const now = new Date();
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    
    const yearWeek = getYearWeek(now);
    const scheduleData = await db.getSchedule(yearWeek);
    if (!scheduleData) return;
    
    const groupId = await db.getSetting('group_chat_id');
    if (!groupId) return;

    const days = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const dayName = days[now.getDay()];
    const shifts = db.getDefaultShifts();
    
    // Tìm ca nào đang diễn ra và vừa mới bắt đầu (trong vòng 5 phút)
    const activeShiftsForIn = shifts.filter(s => {
      const [sh, sm] = s.start.split(':').map(Number);
      // Nếu giờ hiện tại >= giờ bắt đầu và không quá 5 phút
      const startMs = sh * 60 + sm;
      const nowMs = currentH * 60 + currentM;
      return nowMs >= startMs && nowMs < startMs + 5;
    });

    for (const shift of activeShiftsForIn) {
      for (const employeeName in scheduleData) {
        if (scheduleData[employeeName][dayName] == shift.id) {
          // Kiểm tra xem đã chấm công chưa
          const allEmployees = await db.getAllEmployees();
          const zaloId = Object.keys(allEmployees).find(id => allEmployees[id] === employeeName);
          if (zaloId) {
            const att = await db.getAttendanceByDate(zaloId, now.getTime());
            if (!att || !att.check_in_time) {
              await sendZaloMessage(groupId, \`⚠️ CẢNH BÁO: Nhân viên \${employeeName} chưa thấy chấm công vào \${shift.name}!\`);
            }
          }
        }
      }
    }
    
    // 2. Quên chấm ra (Sau khi kết ca 30 phút)
    const activeShiftsForOut = shifts.filter(s => {
      const [eh, em] = s.end.split(':').map(Number);
      const endMs = eh * 60 + em;
      const nowMs = currentH * 60 + currentM;
      // Tròn 30 phút sau khi kết ca
      return nowMs >= endMs + 30 && nowMs < endMs + 35;
    });

    for (const shift of activeShiftsForOut) {
      for (const employeeName in scheduleData) {
        if (scheduleData[employeeName][dayName] == shift.id) {
          const allEmployees = await db.getAllEmployees();
          const zaloId = Object.keys(allEmployees).find(id => allEmployees[id] === employeeName);
          if (zaloId) {
            const att = await db.getAttendanceByDate(zaloId, now.getTime());
            // Nếu có chấm vào mà chưa chấm ra
            if (att && att.check_in_time && !att.check_out_time) {
              await sendZaloMessage(groupId, \`⚠️ CẢNH BÁO: Nhân viên \${employeeName} đã kết thúc \${shift.name} hơn 30 phút nhưng quên chấm ra!\`);
            }
          }
        }
      }
    }
  });

  // 3. Tối chủ nhật 19:00 báo cáo upload lịch
  cron.schedule('0 19 * * 0', async () => {
    const nextWeekDate = new Date();
    nextWeekDate.setDate(nextWeekDate.getDate() + 1); // Monday
    const nextYearWeek = getYearWeek(nextWeekDate);
    
    const scheduleData = await db.getSchedule(nextYearWeek);
    if (!scheduleData || Object.keys(scheduleData).length === 0) {
      await sendToAdmins(\`⚠️ BÁO CÁO: Chưa nhận được dữ liệu Lịch làm việc cho tuần tới (\${nextYearWeek}). Quản lý vui lòng cập nhật lên hệ thống!\`);
    }
  });

  // 4. Dọn dẹp dữ liệu cũ hơn 90 ngày (Chạy lúc 00:00 mỗi ngày)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily 90-day retention cleanup...');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    cutoffDate.setHours(0, 0, 0, 0);

    try {
      const deletedCount = await db.deleteAttendancesOlderThan(cutoffDate.getTime());
      if (deletedCount > 0) {
        console.log(\`Deleted \${deletedCount} old records.\`);
        await sendToAdmins(\`Hệ thống đã tự động dọn dẹp \${deletedCount} bản ghi chấm công cũ hơn 90 ngày (trước \${cutoffDate.toLocaleDateString('vi-VN')}).\`);
      }
    } catch (err) {
      console.error('Error during data cleanup:', err);
    }
  });
}

module.exports = setupCronJobs;
`;

fs.writeFileSync('cronjobs.js', cronCode, 'utf8');
console.log('Overwritten cronjobs.js');
