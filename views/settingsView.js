const db = require('../database');

async function getSettingsHtml(user) {
  if (!user || user.role !== 'SUPER_ADMIN') return null;

  let botOrgName = await db.getSetting('bot_org_name');
  if (!botOrgName) botOrgName = 'Công ty TNHH Demo';

  const html = `
    <!DOCTYPE html>
    <html lang="vi" data-theme="light">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cài đặt Công ty</title>
      <link rel="icon" type="image/png" href="/assets/favicon.png?v=${Date.now()}">
      <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
      <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
      <style>
          :root {
              --bg-color: #f8fafc;
              --card-bg: #ffffff;
              --text-main: #1e293b;
              --border-color: #e2e8f0;
          }
          [data-theme="dark"] {
              --bg-color: #0f172a;
              --card-bg: #1e293b;
              --text-main: #f8fafc;
              --border-color: #334155;
          }
          body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background: var(--bg-color);
              color: var(--text-main);
              padding: 24px;
              max-width: 800px;
              margin: 0 auto;
          }
          .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              margin-bottom: 24px; 
          }
          .btn-primary { 
              background: #2563eb; 
              color: white; 
              border: none;
              padding: 10px 20px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
          }
          .card {
              background: var(--card-bg);
              border: 1px solid var(--border-color);
              border-radius: 12px;
              padding: 24px;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
          }
          input[type="text"] {
              width: 100%;
              padding: 10px;
              margin-top: 8px;
              margin-bottom: 16px;
              border: 1px solid var(--border-color);
              border-radius: 6px;
              background: var(--card-bg);
              color: var(--text-main);
          }
      </style>
      <script>
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        
        async function saveConfig() {
          const bot_org_name = document.getElementById('cfg_bot_org_name').value;
          const res = await fetch('/api/settings/company', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ bot_org_name })
          });
          if (res.ok) {
            alert('Lưu cài đặt thành công!');
          } else {
            alert('Lỗi khi lưu cấu hình');
          }
        }
      </script>
    </head>
    <body>
      <div class="header">
        <h2><ion-icon name="settings-outline"></ion-icon> Cài đặt Hệ thống</h2>
        <button class="btn-primary" onclick="window.location.href='/report'">Quay lại Dashboard</button>
      </div>
      
      <div class="card">
        <h3>Thông tin Công ty</h3>
        <label>Tên Công ty / Tổ chức hiển thị trên báo cáo</label>
        <input type="text" id="cfg_bot_org_name" value="${botOrgName}">
        <button class="btn-primary" onclick="saveConfig()">Lưu thay đổi</button>
      </div>
    </body>
    </html>
  `;
  return html;
}

module.exports = {
  getSettingsHtml
};
