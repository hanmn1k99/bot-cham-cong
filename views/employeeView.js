const getNavHtml = require('./navComponent');
const db = require('../database');

async function getEmployeeHtml(user) {
    const nav = getNavHtml('employees');
    const employees = await db.getAllEmployees();
    
    let tableRows = '';
    let index = 1;
    for (const [zaloId, name] of Object.entries(employees)) {
        tableRows += \`
        <tr>
            <td>\${index++}</td>
            <td style="font-weight:600;">\${name}</td>
            <td style="font-family: monospace; color: var(--text-muted);">\${zaloId}</td>
            <td style="text-align: right;">
                <button class="btn btn-danger" onclick="deleteEmployee('\${zaloId}', '\${name}')">Xóa Nhân Viên</button>
            </td>
        </tr>\`;
    }

    if (!tableRows) {
        tableRows = '<tr><td colspan="4" style="text-align:center; padding: 20px; color: var(--text-muted);">Chưa có nhân viên nào đăng ký</td></tr>';
    }

    return \`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quản Lý Nhân Viên</title>
        <script>
            if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
        </script>
        <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            :root {
                --primary: #2563eb; --bg-color: #f8fafc; --card-bg: #ffffff;
                --text-main: #1e293b; --text-muted: #64748b; --border-color: #e2e8f0;
                --table-header-bg: #f1f5f9; --danger: #ef4444;
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
            .btn { color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 13px; }
            .btn-danger { background: var(--danger); }
            .btn-danger:hover { background: #dc2626; }
        </style>
    </head>
    <body>
        \${nav}
        <div class="container">
            <h2 style="margin-bottom:20px;">Danh Sách Nhân Viên</h2>
            <table>
                <thead>
                    <tr>
                        <th style="width: 5%">STT</th>
                        <th style="width: 30%">Tên Nhân Viên</th>
                        <th style="width: 45%">Mã Zalo ID</th>
                        <th style="text-align: right;">Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    \${tableRows}
                </tbody>
            </table>
        </div>
        
        <script>
            async function deleteEmployee(zaloId, name) {
                if (confirm('Bạn có chắc chắn muốn xóa nhân viên ' + name + ' khỏi hệ thống?')) {
                    const delHistory = confirm('Bạn có muốn XÓA LUÔN toàn bộ Lịch sử chấm công của người này không? (OK = Xóa luôn, Cancel = Giữ lại)');
                    
                    try {
                        const res = await fetch('/api/employees/' + zaloId, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ deleteHistory: delHistory })
                        });
                        const data = await res.json();
                        if (data.success) {
                            alert('Xóa thành công!');
                            window.location.reload();
                        } else {
                            alert('Lỗi khi xóa!');
                        }
                    } catch (err) {
                        alert('Lỗi kết nối');
                    }
                }
            }
        </script>
    </body>
    </html>
    \`;
}

module.exports = { getEmployeeHtml };
