
        function showAlert(msg, isSuccess = false) {
          const overlay = document.createElement('div');
          overlay.style.position = 'fixed';
          overlay.style.top = '0'; overlay.style.left = '0'; overlay.style.width = '100%'; overlay.style.height = '100%';
          overlay.style.background = 'rgba(0,0,0,0.5)';
          overlay.style.zIndex = '10000';
          overlay.style.display = 'flex';
          overlay.style.alignItems = 'center';
          overlay.style.justifyContent = 'center';
          
          const box = document.createElement('div');
          box.style.background = 'var(--card-bg, #fff)';
          box.style.color = 'var(--text-main, #000)';
          box.style.padding = '24px';
          box.style.borderRadius = '12px';
          box.style.minWidth = '320px';
          box.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
          box.style.border = '1px solid var(--border-color, #e2e8f0)';
          
          const text = document.createElement('p');
          text.innerText = msg;
          text.style.marginBottom = '24px';
          text.style.fontWeight = '500';
          text.style.color = isSuccess ? '#10b981' : '#ef4444';
          text.style.lineHeight = '1.5';
          
          const btns = document.createElement('div');
          btns.style.display = 'flex';
          btns.style.justifyContent = 'flex-end';
          
          const btnOk = document.createElement('button');
          btnOk.innerText = 'Đóng';
          btnOk.style.padding = '8px 20px';
          btnOk.style.background = '#2563eb';
          btnOk.style.color = '#fff';
          btnOk.style.border = 'none';
          btnOk.style.borderRadius = '8px';
          btnOk.style.cursor = 'pointer';
          btnOk.style.fontWeight = '600';
          btnOk.onclick = () => overlay.remove();
          
          btns.appendChild(btnOk);
          box.appendChild(text);
          box.appendChild(btns);
          overlay.appendChild(box);
          document.body.appendChild(overlay);
        }

        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        function switchTab(tabId, btn) {
          document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
          document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
          const target = document.getElementById(tabId);
          if (target) target.classList.add('active');
          if (btn) btn.classList.add('active');
          localStorage.setItem('activeSettingsTab', tabId);
        }

        document.addEventListener('DOMContentLoaded', () => {
          const savedTab = localStorage.getItem('activeSettingsTab');
          if (savedTab && document.getElementById(savedTab)) {
            const btn = document.querySelector('.tab-btn[data-tab="' + savedTab + '"]');
            if (btn) switchTab(savedTab, btn);
          }
          loadAdmins();
          loadWebUsers();
        });

        async function saveBotConfig() {
          const bot_org_name = document.getElementById('cfg_bot_org_name').value;
          const bot_user_role = document.getElementById('cfg_bot_user_role').value;
          const bot_pronoun_me = document.getElementById('cfg_bot_pronoun_me').value;
          const bot_pronoun_user_male = document.getElementById('cfg_bot_pronoun_user_male').value;
          const bot_pronoun_user_female = document.getElementById('cfg_bot_pronoun_user_female').value;
          const bot_pronoun_user_default = document.getElementById('cfg_bot_pronoun_user_default').value;
          const bot_environment = document.getElementById('cfg_bot_environment').value;

          const res = await fetch('/api/settings/bot-config', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              bot_org_name,
              bot_user_role,
              bot_pronoun_me,
              bot_pronoun_user_male,
              bot_pronoun_user_female,
              bot_pronoun_user_default,
              bot_environment
            })
          });
          const data = await res.json();
          if (res.ok) {
            showNotification('Đã lưu cấu hình văn phong & xưng hô AI!');
          } else {
            showAlert('Lỗi: ' + (data.error || 'Không thể lưu cấu hình'));
          }
        }

        async function saveFaq() {
          const content = document.getElementById('faqContent').value;
          const res = await fetch('/api/settings/faq', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({content})
          });
          if (res.ok) {
            showNotification('Đã lưu dữ liệu FAQ!');
          } else {
            showAlert('Lỗi khi lưu dữ liệu');
          }
        }

        async function updateGroup(groupId) {
          const name = document.getElementById('gname_' + groupId).value;
          const res = await fetch('/api/settings/group/edit', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({groupId, name})
          });
          if (res.ok) {
            showNotification('Đã cập nhật tên nhóm!');
          } else {
            showAlert('Lỗi khi cập nhật tên nhóm');
          }
        }

        async function deleteGroup(groupId) {
          showCustomConfirm('Bạn có chắc chắn muốn gỡ nhóm này khỏi danh sách nhận thông báo?', async () => {
            const res = await fetch('/api/settings/group/delete', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({groupId})
            });
            if (res.ok) {
              window.location.reload();
            } else {
              showAlert('Lỗi khi xóa nhóm');
            }
          });
        }

        function showCustomConfirm(msg, onConfirm) {
          const overlay = document.createElement('div');
          overlay.style.position = 'fixed';
          overlay.style.top = '0'; overlay.style.left = '0'; overlay.style.width = '100%'; overlay.style.height = '100%';
          overlay.style.background = 'rgba(0,0,0,0.5)';
          overlay.style.zIndex = '10000';
          overlay.style.display = 'flex';
          overlay.style.alignItems = 'center';
          overlay.style.justifyContent = 'center';
          
          const box = document.createElement('div');
          box.style.background = 'var(--card-bg, #fff)';
          box.style.color = 'var(--text-main, #000)';
          box.style.padding = '24px';
          box.style.borderRadius = '12px';
          box.style.minWidth = '320px';
          box.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
          box.style.border = '1px solid var(--border-color, #e2e8f0)';
          
          const text = document.createElement('p');
          text.innerText = msg;
          text.style.marginBottom = '24px';
          text.style.fontWeight = '500';
          text.style.lineHeight = '1.5';
          
          const btns = document.createElement('div');
          btns.style.display = 'flex';
          btns.style.justifyContent = 'flex-end';
          btns.style.gap = '12px';
          
          const btnCancel = document.createElement('button');
          btnCancel.innerText = 'Hủy bỏ';
          btnCancel.style.padding = '8px 16px';
          btnCancel.style.background = 'var(--border-color, #e2e8f0)';
          btnCancel.style.color = 'var(--text-main, #000)';
          btnCancel.style.border = 'none';
          btnCancel.style.borderRadius = '8px';
          btnCancel.style.cursor = 'pointer';
          btnCancel.onclick = () => overlay.remove();
          
          const btnOk = document.createElement('button');
          btnOk.innerText = 'Xác nhận';
          btnOk.style.padding = '8px 16px';
          btnOk.style.background = '#ef4444';
          btnOk.style.color = '#fff';
          btnOk.style.border = 'none';
          btnOk.style.borderRadius = '8px';
          btnOk.style.cursor = 'pointer';
          btnOk.style.fontWeight = '600';
          btnOk.onclick = () => {
             overlay.remove();
             onConfirm();
          };
          
          btns.appendChild(btnCancel);
          btns.appendChild(btnOk);
          box.appendChild(text);
          box.appendChild(btns);
          overlay.appendChild(box);
          document.body.appendChild(overlay);
        }

        async function loadAdmins() {
           try {
             const res = await fetch('/api/admins');
             const data = await res.json();
             if (data.success) {
                renderAdminsTable(data.pending, 'pendingAdminsTbody', true);
                renderAdminsTable(data.admins, 'activeAdminsTbody', false);
                populateZaloDropdown([...data.pending, ...data.admins]);
             }
           } catch(e) { console.error(e); }
        }

        function populateZaloDropdown(admins) {
          const select = document.getElementById('newWebZaloId');
          const editSelect = document.getElementById('editWebZaloId');
          
          const currentVal = select ? select.value : '';
          const currentEditVal = editSelect ? editSelect.value : '';

          let html = '<option value="">-- Chọn tài khoản Zalo --</option>';
          admins.forEach(a => {
             html += '<option value="' + a.id + '">' + a.name + ' (' + a.id + ')</option>';
          });
          
          if (select) {
            select.innerHTML = html;
            if (currentVal) select.value = currentVal;
          }
          if (editSelect) {
            editSelect.innerHTML = html;
            if (currentEditVal) editSelect.value = currentEditVal;
          }
        }

        function renderAdminsTable(list, tbodyId, isPending) {
           const tbody = document.getElementById(tbodyId);
           if (!tbody) return;
           if (list.length === 0) {
              tbody.innerHTML = '<tr><td colspan="3" style="padding:12px; text-align:center; opacity:0.6;">' + (isPending ? 'Không có yêu cầu chờ duyệt.' : 'Chưa có Zalo Admin nào.') + '</td></tr>';
              return;
           }
           let html = '';
           list.forEach(a => {
              const btnHtml = isPending 
                ? '<button onclick="approveAdmin(\'' + a.id + '\')" style="background:#10b981; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:600;">Duyệt</button><button onclick="rejectAdmin(\'' + a.id + '\')" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; margin-left:6px;">Xóa</button>'
                : '<button onclick="revokeAdmin(\'' + a.id + '\')" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px;">Gỡ quyền</button>';
              html += '<tr style="border-bottom:1px solid var(--border-color);"><td style="padding:12px; font-family:monospace;">' + String(a.id).substring(0,4) + '****' + String(a.id).slice(-3) + '</td><td style="padding:12px; font-weight:500;">' + a.name + '</td><td style="padding:12px;">' + btnHtml + '</td></tr>';
           });
           tbody.innerHTML = html;
        }

        async function approveAdmin(id) {
           const res = await fetch('/api/admins/approve', {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({id})
           });
           if (res.ok) {
             showNotification('Đã duyệt Zalo Admin thành công!');
             loadAdmins();
           } else {
             showAlert('Lỗi khi duyệt Admin');
           }
        }

        async function rejectAdmin(id) {
           showCustomConfirm('Bạn có chắc chắn muốn từ chối yêu cầu này?', async () => {
             const res = await fetch('/api/admins/reject', {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({id})
             });
             if (res.ok) {
               showNotification('Đã từ chối yêu cầu');
               loadAdmins();
             } else {
               showAlert('Lỗi khi từ chối yêu cầu');
             }
           });
        }

        async function revokeAdmin(id) {
           showCustomConfirm('Bạn có chắc chắn muốn gỡ quyền Admin của tài khoản này?', async () => {
             const res = await fetch('/api/admins/remove', {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({id})
             });
             if (res.ok) {
               showNotification('Đã gỡ quyền Zalo Admin');
               loadAdmins();
               loadWebUsers();
             } else {
               showAlert('Lỗi khi gỡ quyền Admin');
             }
           });
        }

        async function loadWebUsers() {
           try {
             const res = await fetch('/api/users');
             const data = await res.json();
             if (data.success) {
                renderWebUsersTable(data.users);
             }
           } catch(e) { console.error(e); }
        }

        function renderWebUsersTable(users) {
           const tbody = document.getElementById('webUsersTbody');
           if (!tbody) return;
           if (users.length === 0) {
              tbody.innerHTML = '<tr><td colspan="5" style="padding:12px; text-align:center; opacity:0.6;">Chưa có tài khoản nào.</td></tr>';
              return;
           }
           let html = '';
           users.forEach(u => {
              const roleBadge = u.role === 'SUPER_ADMIN' 
                ? '<span style="background:#fee2e2; color:#991b1b; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:600;">Quản trị viên</span>' 
                : '<span style="background:#e0f2fe; color:#0369a1; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:600;">Vận hành</span>';
              
              const zaloTag = u.zaloId ? ('<span style="font-family:monospace; font-size:12px; background:var(--bg-color); padding:2px 6px; border-radius:4px; border:1px solid var(--border-color);">ID: ' + String(u.zaloId).substring(0,4) + '****' + String(u.zaloId).slice(-3) + '</span>') : '<span style="opacity:0.5;">-</span>';

              html += '<tr style="border-bottom:1px solid var(--border-color);">' +
                '<td style="padding:12px; font-weight:600;">' + u.username + '</td>' +
                '<td style="padding:12px;">' + (u.displayName || '-') + '</td>' +
                '<td style="padding:12px;">' + zaloTag + '</td>' +
                '<td style="padding:12px;">' + roleBadge + '</td>' +
                '<td style="padding:12px; text-align:right;">' +
                  '<button onclick="openEditUserModal(\'' + u.username + '\', \'' + (u.displayName || '') + '\', \'' + (u.zaloId || '') + '\', \'' + u.role + '\')" style="background:#3b82f6; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:500; margin-right:6px;">Sửa</button>' +
                  '<button onclick="deleteWebUser(\'' + u.username + '\')" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:500;">Xóa</button>' +
                '</td>' +
              '</tr>';
           });
           tbody.innerHTML = html;
        }

        async function createWebUser() {
          const username = document.getElementById('newWebUsername').value.trim();
          const password = document.getElementById('newWebPassword').value.trim();
          const role = document.getElementById('newWebRole').value;
          const displayName = document.getElementById('newWebDisplayName').value.trim();
          const zaloId = document.getElementById('newWebZaloId').value;
          
          if (!username || !password || !displayName || !zaloId) {
             showAlert('Vui lòng nhập đầy đủ thông tin (*).');
             return;
          }
          
          const res = await fetch('/api/users/create', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password, role, displayName, zaloId})
          });
          const data = await res.json();
          if (res.ok) {
            showCustomConfirm('Tạo tài khoản thành công! Mã khôi phục (QUAN TRỌNG): ' + data.recoveryKey + '\n\nHãy lưu lại mã này để khôi phục mật khẩu khi cần.', () => {
               document.getElementById('newWebUsername').value = '';
               document.getElementById('newWebPassword').value = '';
               document.getElementById('newWebDisplayName').value = '';
               document.getElementById('newWebZaloId').value = '';
               loadWebUsers();
            });
          } else {
            showAlert('Lỗi: ' + (data.error || 'Không thể tạo tài khoản'));
          }
        }

        function openEditUserModal(username, displayName, zaloId, role) {
          document.getElementById('editWebUsername').value = username;
          document.getElementById('editWebDisplayName').value = displayName;
          document.getElementById('editWebZaloId').value = zaloId;
          document.getElementById('editWebRole').value = role;
          document.getElementById('editWebPassword').value = '';
          document.getElementById('editUserModal').style.display = 'flex';
        }

        function closeEditUserModal() {
          document.getElementById('editUserModal').style.display = 'none';
        }

        async function submitEditWebUser() {
          const username = document.getElementById('editWebUsername').value;
          const displayName = document.getElementById('editWebDisplayName').value.trim();
          const zaloId = document.getElementById('editWebZaloId').value;
          const role = document.getElementById('editWebRole').value;
          const password = document.getElementById('editWebPassword').value.trim();

          if (!displayName || !zaloId) {
            showAlert('Vui lòng điền đầy đủ Tên hiển thị và liên kết Zalo.');
            return;
          }

          const res = await fetch('/api/users/edit', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, displayName, zaloId, role, password: password || undefined})
          });
          const data = await res.json();
          if (res.ok) {
            showNotification('Đã cập nhật tài khoản!');
            closeEditUserModal();
            loadWebUsers();
          } else {
            showAlert('Lỗi: ' + (data.error || 'Không thể cập nhật'));
          }
        }

        async function deleteWebUser(username) {
           showCustomConfirm('Bạn có chắc muốn xóa tài khoản [' + username + ']? Hành động này không thể hoàn tác.', async () => {
             const res = await fetch('/api/users/delete', {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({username})
             });
             const data = await res.json();
             if (res.ok) {
               showNotification('Đã xóa tài khoản');
               loadWebUsers();
             } else {
               showAlert('Lỗi: ' + data.error);
             }
           });
        }

        function showNotification(msg) {
          let old = document.getElementById('notification-toast');
          if (old) old.remove();
          const div = document.createElement('div');
          div.id = 'notification-toast';
          div.style.position = 'fixed';
          div.style.top = '20px';
          div.style.right = '20px';
          div.style.background = '#10b981';
          div.style.color = '#fff';
          div.style.padding = '12px 24px';
          div.style.borderRadius = '8px';
          div.style.fontWeight = '600';
          div.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
          div.style.zIndex = '10001';
          div.innerText = msg;
          document.body.appendChild(div);
          setTimeout(() => div.remove(), 3000);
        }
      