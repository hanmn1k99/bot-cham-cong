const fs = require('fs');

// Patch index.js
let indexCode = fs.readFileSync('index.js', 'utf8');
indexCode = indexCode.replace("const webhookRoutes = require('./routes/webhookRoutes');", 
  "const webhookRoutes = require('./routes/webhookRoutes');\nconst scheduleRoutes = require('./routes/scheduleRoutes');\nconst employeeRoutes = require('./routes/employeeRoutes');");
indexCode = indexCode.replace("app.use(webhookRoutes);", 
  "app.use(webhookRoutes);\napp.use(scheduleRoutes);\napp.use(employeeRoutes);");
fs.writeFileSync('index.js', indexCode, 'utf8');
console.log('Patched index.js');

// Patch dashboardView.js
let dashboardCode = fs.readFileSync('views/dashboardView.js', 'utf8');
// Insert getNavHtml import
if (!dashboardCode.includes('getNavHtml')) {
  dashboardCode = dashboardCode.replace("const db = require('../database');", "const db = require('../database');\nconst getNavHtml = require('./navComponent');");
}
// Insert ${nav} into HTML
if (!dashboardCode.includes('${nav}')) {
  // Find where body starts
  dashboardCode = dashboardCode.replace('<body>', '<body>\n    ${nav}');
}
// Add nav variable inside getDashboardHtml
if (!dashboardCode.includes("const nav = getNavHtml('report');")) {
  dashboardCode = dashboardCode.replace("async function getDashboardHtml(user) {", "async function getDashboardHtml(user) {\n    const nav = getNavHtml('report');");
}
fs.writeFileSync('views/dashboardView.js', dashboardCode, 'utf8');
console.log('Patched dashboardView.js');
