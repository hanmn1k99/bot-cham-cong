function getNavHtml(activePage) {
    return \`
    <div style="background: var(--card-bg); padding: 15px 30px; border-bottom: 1px solid var(--border-color); display: flex; gap: 20px; font-weight: 500; font-size: 14px; align-items: center;">
        <a href="/report" style="text-decoration: none; padding: 8px 16px; border-radius: 6px; color: \${activePage === 'report' ? '#2563eb' : 'var(--text-muted)'}; background: \${activePage === 'report' ? '#eff6ff' : 'transparent'};"><ion-icon name="stats-chart-outline"></ion-icon> Báo Cáo</a>
        <a href="/schedule" style="text-decoration: none; padding: 8px 16px; border-radius: 6px; color: \${activePage === 'schedule' ? '#2563eb' : 'var(--text-muted)'}; background: \${activePage === 'schedule' ? '#eff6ff' : 'transparent'};"><ion-icon name="calendar-outline"></ion-icon> Lịch Làm Việc</a>
        <a href="/employees" style="text-decoration: none; padding: 8px 16px; border-radius: 6px; color: \${activePage === 'employees' ? '#2563eb' : 'var(--text-muted)'}; background: \${activePage === 'employees' ? '#eff6ff' : 'transparent'};"><ion-icon name="people-outline"></ion-icon> Nhân Viên</a>
    </div>
    \`;
}
module.exports = getNavHtml;
