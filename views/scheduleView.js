const getNavHtml = require('./navComponent');
const db = require('../database');

function getYearWeek(d) {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  return date.getFullYear() + '-W' + String(weekNum).padStart(2, '0');
}

async function getScheduleHtml(user) {
    const nav = getNavHtml('schedule');
    const shifts = db.getDefaultShifts();
    
    // Get schedule for current week
    const currentWeek = getYearWeek(new Date());
    const scheduleData = await db.getSchedule(currentWeek) || {};
    
    let tableRows = '';
    const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
    
    let index = 1;
    for (const [empName, schedule] of Object.entries(scheduleData)) {
        let tdDays = '';
        for (const day of days) {
            const shiftId = schedule[day];
            let shiftLabel = '-';
            if (shiftId) {
                const s = shifts.find(x => x.id == shiftId);
                if (s) shiftLabel = \`<span style="background:#dbeafe; color:#1e40af; padding:2px 8px; border-radius:4px; font-size:12px;">\${s.name}</span>\`;
            }
            tdDays += \`<td style="text-align:center;">\${shiftLabel}</td>\`;
        }
        
        tableRows += \`
        <tr>
            <td>\${index++}</td>
            <td style="font-weight:600;">\${empName}</td>
            \${tdDays}
        </tr>\`;
    }

    if (!tableRows) {
        tableRows = '<tr><td colspan="9" style="text-align:center; padding: 20px; color: var(--text-muted);">Chưa có dữ liệu lịch làm việc tuần này</td></tr>';
    }

    return \`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lịch Làm Việc</title>
        <script>
            if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        </script>
        <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            :root {
                --primary: #2563eb; --bg-color: #f8fafc; --card-bg: #ffffff;
                --text-main: #1e293b; --text-muted: #64748b; --border-color: #e2e8f0;
                --table-header-bg: #f1f5f9;
            }
            [data-theme="dark"] {
                --bg-color: #0f172a; --card-bg: #1e293b;
                --text-main: #f8fafc; --text-muted: #94a3b8; --border-color: #334155;
                --table-header-bg: #334155;
            }
            body { font-family: 'Inter', sans-serif; background: var(--bg-color); color: var(--text-main); margin: 0; }
            .container { padding: 30px; max-width: 1200px; margin: 0 auto; }
            table { width: 100%; border-collapse: collapse; background: var(--card-bg); border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            th, td { padding: 12px; border-bottom: 1px solid var(--border-color); text-align: left; }
            th { background: var(--table-header-bg); font-size: 13px; text-transform: uppercase; color: var(--text-muted); }
            .btn { background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; }
            .btn-outline { background: transparent; color: var(--text-main); border: 1px solid var(--border-color); }
        </style>
    </head>
    <body>
        \${nav}
        <div class="container">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2>Lịch Làm Việc (Tuần \${currentWeek.split('W')[1]})</h2>
                <div style="display:flex; gap:10px;">
                    <a href="/api/schedule/template" class="btn btn-outline" download><ion-icon name="download-outline"></ion-icon> Tải Mẫu Excel</a>
                    <button class="btn" onclick="document.getElementById('uploadFile').click()"><ion-icon name="cloud-upload-outline"></ion-icon> Upload Lịch (Tuần tới)</button>
                    <input type="file" id="uploadFile" style="display:none" accept=".xlsx, .xls">
                </div>
            </div>
            
            <div style="margin-bottom: 20px; font-size: 13px; color: var(--text-muted);">
                <b>Quy ước ca mặc định:</b> Ca 1 (06:00 - 12:00) | Ca 2 (12:00 - 18:00) | Ca 3 (18:00 - 24:00)
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 5%">STT</th>
                        <th style="width: 20%">Nhân Viên</th>
                        <th style="text-align:center;">Thứ 2</th>
                        <th style="text-align:center;">Thứ 3</th>
                        <th style="text-align:center;">Thứ 4</th>
                        <th style="text-align:center;">Thứ 5</th>
                        <th style="text-align:center;">Thứ 6</th>
                        <th style="text-align:center;">Thứ 7</th>
                        <th style="text-align:center;">Chủ Nhật</th>
                    </tr>
                </thead>
                <tbody>
                    \${tableRows}
                </tbody>
            </table>
        </div>
        
        <script>
            document.getElementById('uploadFile').addEventListener('change', async function(e) {
                if (!e.target.files[0]) return;
                const formData = new FormData();
                formData.append('file', e.target.files[0]);
                
                try {
                    const res = await fetch('/api/schedule/upload', {
                        method: 'POST',
                        body: formData
                    });
                    const data = await res.json();
                    if (data.success) {
                        alert('Upload lịch làm việc thành công!');
                        window.location.reload();
                    } else {
                        alert('Lỗi: ' + data.error);
                    }
                } catch (err) {
                    alert('Lỗi kết nối');
                }
            });
        </script>
    </body>
    </html>
    \`;
}

module.exports = { getScheduleHtml };
