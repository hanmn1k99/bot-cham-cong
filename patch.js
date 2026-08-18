const fs = require('fs');

// Patch webhookRoutes.js
let webhookCode = fs.readFileSync('routes/webhookRoutes.js', 'utf8');

const setGroupCode = `
    if (text.trim() === '/setgroup') {
      if (!isAdminUser) return;
      if (chatId === senderId) {
        await sendZaloMessage(chatId, "⚠️ Lệnh này phải được gõ ở trong một Nhóm Zalo.");
        return;
      }
      await db.setSetting('group_chat_id', chatId);
      await sendZaloMessage(chatId, "✅ Đã cài đặt nhóm này làm Nhóm Cảnh Báo Chấm Công.");
      return;
    }
`;

webhookCode = webhookCode.replace("if (text.trim() === '/report') {", setGroupCode + "\n    if (text.trim() === '/report') {");

const earlyCheckoutCode = `
      // Early check-out check
      const currentAttendance = await db.getAttendanceByDate(senderId, timestamp);
      let note = "";
      if (currentAttendance && !currentAttendance.check_out_time) {
        let isEarly = false;
        
        function getYearWeek(d) {
          const date = new Date(d.getTime());
          date.setHours(0, 0, 0, 0);
          date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
          const week1 = new Date(date.getFullYear(), 0, 4);
          const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
          return date.getFullYear() + '-W' + String(weekNum).padStart(2, '0');
        }
        
        const yearWeek = getYearWeek(dateObj);
        const scheduleData = await db.getSchedule(yearWeek) || {};
        const employeeSchedule = scheduleData[employeeName];
        
        if (employeeSchedule) {
          const days = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
          const dayName = days[dateObj.getDay()];
          const shiftId = employeeSchedule[dayName];
          if (shiftId) {
            const shifts = db.getDefaultShifts();
            const shiftInfo = shifts.find(s => s.id === parseInt(shiftId));
            if (shiftInfo) {
               const [endH, endM] = shiftInfo.end.split(':').map(Number);
               const currentH = dateObj.getHours();
               const currentM = dateObj.getMinutes();
               if (currentH < endH || (currentH === endH && currentM < endM)) {
                 isEarly = true;
               }
            }
          }
        }
        
        if (isEarly) {
          if (cleanTextForCmd.toLowerCase().startsWith('ra ')) {
            note = cleanTextForCmd.substring(3).trim();
          }
          if (!note) {
            await sendZaloMessage(chatId, "⚠️ Chưa đến giờ tan ca. Nếu có việc gấp cần về sớm, vui lòng gõ: " + botMention + " ra [Lý do]");
            return;
          }
        }
      }

      const location = "Zalo";
      const { record, status } = await db.recordAttendance(timestamp, senderId, employeeName, chatId, chatName, location);
      
      if (status === 'out' && note) {
         await db.updateAttendance(record.id, undefined, undefined, undefined, undefined, note);
      }
`;

webhookCode = webhookCode.replace(
  `const location = "Zalo";
      const { record, status } = await db.recordAttendance(timestamp, senderId, employeeName, chatId, chatName, location);`,
  earlyCheckoutCode
);

fs.writeFileSync('routes/webhookRoutes.js', webhookCode, 'utf8');
console.log('Patched webhookRoutes.js');
