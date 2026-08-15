const fs = require('fs');
const path = require('path');
const db = require('../database');

async function renderTableRows() {
  const attendances = await db.getAllAttendances();
  const groupNames = await db.getAllGroupNames();
  
  return attendances.map((r, index) => {
     const currentChatName = groupNames[r.chat_id] || r.chat_name || 'Cá nhân';
     
     // Format check in
     let checkInTime = '-';
     let checkInVal = '';
     if (r.check_in_time) {
         const d = new Date(r.check_in_time);
         checkInTime = d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
         checkInVal = checkInTime;
     }
     
     // Format check out
     let checkOutTime = '-';
     let checkOutVal = '';
     if (r.check_out_time) {
         const d = new Date(r.check_out_time);
         checkOutTime = d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
         checkOutVal = checkOutTime;
     }

     // Format OT check in
     let checkInOTTime = '-';
     let checkInOTVal = '';
     if (r.overtime_in_time) {
         const d = new Date(r.overtime_in_time);
         checkInOTTime = d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
         checkInOTVal = checkInOTTime;
     }

     // Format OT check out
     let checkOutOTTime = '-';
     let checkOutOTVal = '';
     if (r.overtime_out_time) {
         const d = new Date(r.overtime_out_time);
         checkOutOTTime = d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
         checkOutOTVal = checkOutOTTime;
     }

     const dateStr = r.date.split('-').reverse().join('/'); // YYYY-MM-DD -> DD/MM/YYYY
     
     const noteText = r.note ? `<div style="font-size:12px; background:var(--bg-color); padding:6px; border-radius:4px; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${r.note.replace(/"/g, '&quot;')}">${r.note}</div>` : `<span style="color:var(--text-muted); font-size:13px;">-</span>`;

     return `
      <tr>
        <td><strong>${index + 1}</strong></td>
        <td><span style="color:var(--text-muted); font-size:13px;">${dateStr}</span></td>
        <td style="font-weight: 500;">${r.name}</td>
        <td>
            <div style="display:inline-flex; align-items:center; gap:4px; padding: 4px 8px; background: #ecfdf5; color: #065f46; border-radius: 6px; font-size: 13px; font-weight: 600;">
                <ion-icon name="log-in-outline"></ion-icon> ${checkInTime}
            </div>
        </td>
        <td>
            ${checkOutTime !== '-' ? `
            <div style="display:inline-flex; align-items:center; gap:4px; padding: 4px 8px; background: #fef2f2; color: #991b1b; border-radius: 6px; font-size: 13px; font-weight: 600;">
                <ion-icon name="log-out-outline"></ion-icon> ${checkOutTime}
            </div>` : '<span style="color: var(--text-muted); font-size:13px;">Chưa ra</span>'}
        </td>
        <td>
            ${checkInOTTime !== '-' ? `
            <div style="display:inline-flex; align-items:center; gap:4px; padding: 4px 8px; background: #fffbeb; color: #b45309; border-radius: 6px; font-size: 13px; font-weight: 600;">
                <ion-icon name="log-in-outline"></ion-icon> ${checkInOTTime}
            </div>` : '<span style="color: var(--text-muted); font-size:13px;">-</span>'}
        </td>
        <td>
            ${checkOutOTTime !== '-' ? `
            <div style="display:inline-flex; align-items:center; gap:4px; padding: 4px 8px; background: #fff1f2; color: #be123c; border-radius: 6px; font-size: 13px; font-weight: 600;">
                <ion-icon name="log-out-outline"></ion-icon> ${checkOutOTTime}
            </div>` : '<span style="color: var(--text-muted); font-size:13px;">-</span>'}
        </td>
        <td>${noteText}</td>
        <td><span style="background:var(--btn-secondary-bg); padding:4px 10px; border-radius:9999px; font-size:12px; display:inline-block; word-break:break-word; white-space:normal;">${currentChatName}</span></td>
        <td>
            <button onclick="openEditModal(${r.id}, '${checkInVal}', '${checkOutVal}', '${checkInOTVal}', '${checkOutOTVal}', '${(r.note || '').replace(/'/g, "\\'")}')" style="background:none; border:1px solid var(--border-color); color:var(--text-main); padding:6px; border-radius:6px; cursor:pointer;" title="Sửa giờ"><ion-icon name="pencil-outline"></ion-icon></button>
        </td>
      </tr>`;
  }).join('');
}

async function getDashboardHtml(user) {
  const formattedRows = await renderTableRows();
  let botOrgName = await db.getSetting('bot_org_name');
  if (!botOrgName) botOrgName = 'Công ty TNHH Demo';
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hệ thống Chấm Công - ${botOrgName}</title>
      <script>
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
      </script>
      <link rel="icon" type="image/png" href="/assets/favicon.png?v=${Date.now()}">
      <meta name="theme-color" content="#2563eb">
      <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
      <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
      <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          :root {
              --primary: #2563eb;
              --primary-hover: #1d4ed8;
              --bg-color: #f8fafc;
              --card-bg: #ffffff;
              --text-main: #1e293b;
              --text-muted: #64748b;
              --border-color: #e2e8f0;
              --table-header-bg: #f1f5f9;
              --table-hover-bg: #f8fafc;
              --btn-secondary-bg: #f1f5f9;
              --btn-secondary-text: #475569;
              --btn-secondary-border: #cbd5e1;
          }
          [data-theme="dark"] {
              --bg-color: #0f172a;
              --card-bg: #1e293b;
              --text-main: #f8fafc;
              --text-muted: #94a3b8;
              --border-color: #334155;
              --table-header-bg: #334155;
              --table-hover-bg: #0f172a;
              --btn-secondary-bg: #1e293b;
              --btn-secondary-text: #cbd5e1;
              --btn-secondary-border: #475569;
          }
          body { 
              font-family: 'Inter', sans-serif; 
              padding: 30px; 
              background-color: var(--bg-color);
              color: var(--text-main);
              margin: 0;
          }
          .container { max-width: 1200px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px; }
          .header h2 { margin: 0; font-size: 24px; font-weight: 700; display: flex; align-items: center; gap: 12px; }
          .controls { display: flex; gap: 15px; align-items: center; flex-wrap: nowrap; }
          input[type="text"], input[type="date"], select { padding: 10px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; background-color: var(--card-bg); color: var(--text-main); }
          button { background-color: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
          button.btn-secondary { background-color: var(--btn-secondary-bg); color: var(--btn-secondary-text); border: 1px solid var(--btn-secondary-border); }
          .table-wrapper { background: var(--card-bg); border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow-x: auto; }
          table { width: 100%; border-collapse: collapse; min-width: 800px; }
          th, td { padding: 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
          th { background-color: var(--table-header-bg); color: var(--text-muted); font-size: 13px; text-transform: uppercase; }
          td { font-size: 14px; }
          .dropdown { position: relative; display: inline-block; }
          .dropdown-content { display: none; position: absolute; right: 0; background-color: var(--card-bg); min-width: 180px; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2); border-radius: 6px; border: 1px solid var(--border-color); }
          .dropdown-content button { color: var(--text-main); padding: 10px 16px; display: flex; align-items: center; gap: 8px; width: 100%; border: none; background: none; text-align: left; cursor: pointer; font-size: 14px; }
          .dropdown-content button:hover { background-color: var(--table-hover-bg); }
          .dropdown:hover .dropdown-content { display: block; }
          .empty-state { text-align: center; padding: 40px; color: var(--text-muted); display: none; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h2>
                  <div style="display:flex; flex-direction:column;">
                      <span class="screen-title" style="font-size: 20px; font-weight: 700;">${botOrgName}</span>
                      <span class="screen-title" style="font-size: 13px; font-weight: 400; color: var(--text-muted); margin-top: 3px;">Báo cáo điểm danh - Tháng ${currentMonth}/${currentYear}</span>
                  </div>
              </h2>
              
              <div class="action-bar" style="display:flex; align-items:center; gap:10px;">
                  <button class="btn-secondary" onclick="toggleDarkMode()" title="Đổi giao diện"><ion-icon name="moon-outline"></ion-icon></button>
                  <button class="btn-secondary" onclick="window.location.reload()" title="Tải lại"><ion-icon name="refresh-outline"></ion-icon></button>
                  <button class="btn-secondary" onclick="window.location.href='/settings'" title="Cài đặt"><ion-icon name="settings-outline"></ion-icon></button>
                  <div class="dropdown">
                      <button class="btn-secondary"><ion-icon name="person-circle-outline"></ion-icon> Tài khoản</button>
                      <div class="dropdown-content">
                          ${(!user || user.role === 'SUPER_ADMIN') ? '<button onclick="cleanData()" style="color:#ef4444;"><ion-icon name="trash-outline"></ion-icon> Xóa CSDL</button>' : ''}
                          <button onclick="window.location.href='/logout'" style="color:#475569;"><ion-icon name="log-out-outline"></ion-icon> Đăng xuất</button>
                      </div>
                  </div>
              </div>
          </div>

          <div class="controls" style="margin-bottom: 20px;">
              <input type="date" id="dateFilter" title="Lọc theo ngày">
              <select id="nameFilter">
                  <option value="">-- Tất cả nhân viên --</option>
              </select>
              <input type="text" id="searchInput" placeholder="Tìm kiếm tự do..." style="width: 250px;">
          </div>

          <div class="table-wrapper">
              <table id="reportTable">
                  <thead>
                      <tr>
                          <th style="width: 5%">STT</th>
                          <th style="width: 10%">Ngày</th>
                          <th style="width: 15%">Nhân viên</th>
                          <th style="width: 10%">Giờ vào</th>
                          <th style="width: 10%">Giờ ra</th>
                          <th style="width: 10%">Vào (TC)</th>
                          <th style="width: 10%">Ra (TC)</th>
                          <th style="width: 10%">Ghi chú</th>
                          <th style="width: 15%">Nhóm / Vị trí</th>
                          <th style="width: 5%">Sửa</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${formattedRows}
                  </tbody>
              </table>
              <div id="emptyState" class="empty-state">Không có dữ liệu chấm công.</div>
          </div>
      </div>

      <!-- Edit Modal -->
      <div id="editModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000; align-items:center; justify-content:center;">
          <div style="background:var(--card-bg); color:var(--text-main); padding:24px; border-radius:12px; width:400px; max-width:90%; border:1px solid var(--border-color); box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
              <h3 style="margin-top:0; border-bottom:1px solid var(--border-color); padding-bottom:12px;">Sửa giờ chấm công</h3>
              <input type="hidden" id="editId">
              
              <div style="margin-bottom:16px; display:flex; gap:16px;">
                  <div style="flex:1;">
                      <label style="display:block; font-size:13px; font-weight:600; margin-bottom:8px;">Giờ Vào</label>
                      <input type="time" id="editCheckIn" style="width:100%; box-sizing:border-box;">
                  </div>
                  <div style="flex:1;">
                      <label style="display:block; font-size:13px; font-weight:600; margin-bottom:8px;">Giờ Ra</label>
                      <input type="time" id="editCheckOut" style="width:100%; box-sizing:border-box;">
                  </div>
              </div>
              
              <div style="margin-bottom:16px; display:flex; gap:16px; border-top:1px dashed var(--border-color); padding-top:16px;">
                  <div style="flex:1;">
                      <label style="display:block; font-size:13px; font-weight:600; margin-bottom:8px; color:#b45309;">Giờ Vào (TC)</label>
                      <input type="time" id="editCheckInOT" style="width:100%; box-sizing:border-box;">
                  </div>
                  <div style="flex:1;">
                      <label style="display:block; font-size:13px; font-weight:600; margin-bottom:8px; color:#b45309;">Giờ Ra (TC)</label>
                      <input type="time" id="editCheckOutOT" style="width:100%; box-sizing:border-box;">
                  </div>
              </div>
              
              <div style="margin-bottom:16px;">
                  <label style="display:block; font-size:13px; font-weight:600; margin-bottom:8px;">Ghi chú / Giải trình (Bắt buộc) <span style="color:red">*</span></label>
                  <textarea id="editNote" rows="3" placeholder="Lý do sửa giờ..." style="width:100%; box-sizing:border-box; padding:10px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main); resize:vertical; font-family:inherit; font-size:14px;"></textarea>
              </div>
              
              <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px;">
                  <button onclick="closeEditModal()" style="background:var(--border-color); color:var(--text-main); padding:8px 16px; border:none; border-radius:6px; cursor:pointer; font-weight:500;">Hủy</button>
                  <button onclick="saveEdit()" style="background:#2563eb; color:white; padding:8px 16px; border:none; border-radius:6px; cursor:pointer; font-weight:600;">Lưu thay đổi</button>
              </div>
          </div>
      </div>

      <script>
          function toggleDarkMode() {
              const current = document.documentElement.getAttribute('data-theme');
              if (current === 'dark') {
                  document.documentElement.setAttribute('data-theme', 'light');
                  localStorage.setItem('theme', 'light');
              } else {
                  document.documentElement.setAttribute('data-theme', 'dark');
                  localStorage.setItem('theme', 'dark');
              }
          }

          function cleanData() {
              if (confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu chấm công không? Hành động này không thể hoàn tác!')) {
                  fetch('/api/attendances/clean', { method: 'POST' })
                  .then(r => r.json())
                  .then(data => {
                      if (data.success) {
                          alert('Xóa dữ liệu thành công!');
                          window.location.reload();
                      }
                  });
              }
          }

          const searchInput = document.getElementById('searchInput');
          const nameFilter = document.getElementById('nameFilter');
          const dateFilter = document.getElementById('dateFilter');
          const table = document.getElementById('reportTable');
          const emptyState = document.getElementById('emptyState');

          function getRows() {
              return table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
          }

          function updateNameDropdown() {
              const rows = getRows();
              const uniqueNames = new Set();
              for (let i = 0; i < rows.length; i++) {
                  const nameCell = rows[i].getElementsByTagName('td')[2];
                  if (nameCell) {
                      uniqueNames.add(nameCell.textContent.trim());
                  }
              }
              const currentValue = nameFilter.value;
              nameFilter.innerHTML = '<option value="">-- Tất cả nhân viên --</option>';
              uniqueNames.forEach(name => {
                  const option = document.createElement('option');
                  option.value = name.toLowerCase();
                  option.textContent = name;
                  if (option.value === currentValue) option.selected = true;
                  nameFilter.appendChild(option);
              });
          }

          function filterData() {
              const searchText = searchInput.value.toLowerCase();
              const selectedName = nameFilter.value;
              const selectedDate = dateFilter.value; // format YYYY-MM-DD
              
              let formattedDateFilter = "";
              if (selectedDate) {
                  const parts = selectedDate.split('-');
                  formattedDateFilter = parts[2] + "/" + parts[1] + "/" + parts[0];
              }

              const rows = getRows();
              let visibleCount = 0;

              for (let i = 0; i < rows.length; i++) {
                  const text = rows[i].textContent || rows[i].innerText;
                  const dateCell = rows[i].getElementsByTagName('td')[1];
                  const nameCell = rows[i].getElementsByTagName('td')[2];
                  
                  if (!nameCell || !dateCell) continue;

                  const dateCellText = dateCell.textContent.trim();
                  const nameCellText = nameCell.textContent.trim().toLowerCase();
                  
                  const matchesSearch = text.toLowerCase().indexOf(searchText) > -1;
                  const matchesName = selectedName === "" || nameCellText === selectedName;
                  const matchesDate = formattedDateFilter === "" || dateCellText === formattedDateFilter;

                  if (matchesSearch && matchesName && matchesDate) {
                      rows[i].style.display = '';
                      visibleCount++;
                  } else {
                      rows[i].style.display = 'none';
                  }
              }

              if (visibleCount === 0) {
                  table.style.display = 'none';
                  emptyState.style.display = 'block';
              } else {
                  table.style.display = '';
                  emptyState.style.display = 'none';
              }
          }

          searchInput.addEventListener('keyup', filterData);
          nameFilter.addEventListener('change', filterData);
          dateFilter.addEventListener('change', filterData);

          updateNameDropdown();
          
          function openEditModal(id, checkIn, checkOut, checkInOT, checkOutOT, note) {
              document.getElementById('editId').value = id;
              document.getElementById('editCheckIn').value = checkIn;
              document.getElementById('editCheckOut').value = checkOut;
              document.getElementById('editCheckInOT').value = checkInOT;
              document.getElementById('editCheckOutOT').value = checkOutOT;
              document.getElementById('editNote').value = note || '';
              document.getElementById('editModal').style.display = 'flex';
          }
          
          function closeEditModal() {
              document.getElementById('editModal').style.display = 'none';
          }
          
          async function saveEdit() {
              const id = document.getElementById('editId').value;
              const checkIn = document.getElementById('editCheckIn').value;
              const checkOut = document.getElementById('editCheckOut').value;
              const checkInOT = document.getElementById('editCheckInOT').value;
              const checkOutOT = document.getElementById('editCheckOutOT').value;
              const note = document.getElementById('editNote').value;
              
              if (!note || note.trim() === '') {
                  alert('Vui lòng nhập Ghi chú / Giải trình cho việc sửa đổi này!');
                  return;
              }
              
              try {
                  const res = await fetch('/api/attendances/edit', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ id, checkIn, checkOut, checkInOT, checkOutOT, note })
                  });
                  const data = await res.json();
                  if (data.success) {
                      closeEditModal();
                      fetchAndRenderRows();
                  } else {
                      alert('Lỗi: ' + data.error);
                  }
              } catch (e) {
                  console.error(e);
                  alert('Lỗi kết nối');
              }
          }

          async function fetchAndRenderRows() {
              try {
                  const res = await fetch('/api/attendances/rows');
                  if (res.status === 401 || res.status === 403) {
                      window.location.href = '/logout';
                      return;
                  }
                  const data = await res.json();
                  if (data.success) {
                      table.getElementsByTagName('tbody')[0].innerHTML = data.html;
                      updateNameDropdown();
                      filterData();
                  }
              } catch (e) {
                  console.error('Polling error', e);
              }
          }

          setInterval(fetchAndRenderRows, 15000); // 15 seconds polling
      </script>
  </body>
  </html>
  `;
  return htmlContent;
}

module.exports = {
  getDashboardHtml,
  renderTableRows
};
