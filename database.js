const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');

// Helper to read DB
function readDB() {
  if (!fs.existsSync(dbPath)) {
    return { settings: {}, attendances: [], employees: {} };
  }
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(data);
    if (!db.attendances) db.attendances = [];
    if (!db.employees) db.employees = {};
    return db;
  } catch (err) {
    console.error("Error reading database:", err);
    return { settings: {}, attendances: [], employees: {} };
  }
}

// Helper to write DB
function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

// Settings API
async function getSetting(key) {
  const db = readDB();
  return db.settings[key] || null;
}

async function setSetting(key, value) {
  const db = readDB();
  db.settings[key] = value;
  writeDB(db);
}

// Employees API
async function registerEmployee(zaloId, name) {
  const db = readDB();
  db.employees[zaloId] = name;
  writeDB(db);
}

async function getEmployee(zaloId) {
  const db = readDB();
  return db.employees[zaloId] || null;
}

async function getAllEmployees() {
  const db = readDB();
  return db.employees;
}

// Attendances API
async function recordAttendance(timestamp, senderId, name, chatId, chatName, location) {
  const db = readDB();
  const d = new Date(timestamp);
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  let record = db.attendances.find(r => r.zalo_id === senderId && r.date === dateStr);
  let status = 'in';

  if (record) {
    if (record.check_out_time) {
      return { record, status: 'already_out' };
    }
    record.check_out_time = timestamp;
    record.location = location || record.location;
    status = 'out';
  } else {
    const newId = db.attendances.length > 0 ? db.attendances[db.attendances.length - 1].id + 1 : 1;
    record = {
      id: newId,
      date: dateStr,
      zalo_id: senderId,
      name: name,
      chat_id: chatId,
      chat_name: chatName,
      location: location || "Không xác định",
      check_in_time: timestamp,
      check_out_time: null,
      overtime_in_time: null,
      overtime_out_time: null,
      note: ""
    };
    db.attendances.push(record);
  }
  
  writeDB(db);
  return { record, status };
}

async function setOvertime(senderId, timestamp) {
  const db = readDB();
  const d = new Date(timestamp);
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const record = db.attendances.find(r => r.zalo_id === senderId && r.date === dateStr);
  if (!record) {
    return { status: 'no_main_shift' };
  }
  
  if (!record.overtime_in_time) {
    record.overtime_in_time = timestamp;
    writeDB(db);
    return { record, status: 'in_ot' };
  } else if (!record.overtime_out_time) {
    record.overtime_out_time = timestamp;
    writeDB(db);
    return { record, status: 'out_ot' };
  } else {
    return { record, status: 'already_out_ot' };
  }
}

async function updateAttendance(id, checkInTime, checkOutTime, otInTime, otOutTime, note) {
  const db = readDB();
  const record = db.attendances.find(r => r.id === parseInt(id));
  if (record) {
    if (checkInTime !== undefined) record.check_in_time = checkInTime;
    if (checkOutTime !== undefined) record.check_out_time = checkOutTime;
    if (otInTime !== undefined) record.overtime_in_time = otInTime;
    if (otOutTime !== undefined) record.overtime_out_time = otOutTime;
    record.note = note;
    writeDB(db);
    return true;
  }
  return false;
}

async function getAttendanceByDate(senderId, timestamp) {
  const db = readDB();
  const d = new Date(timestamp);
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return db.attendances.find(r => r.zalo_id === senderId && r.date === dateStr);
}

async function getAllAttendances() {
  const db = readDB();
  return db.attendances.sort((a, b) => {
    // Sort by Date descending, then Check In Time descending
    if (a.date !== b.date) {
      return new Date(b.date) - new Date(a.date);
    }
    return b.check_in_time - a.check_in_time;
  });
}

async function deleteAllAttendances() {
  const db = readDB();
  const deletedCount = db.attendances ? db.attendances.length : 0;
  db.attendances = [];
  writeDB(db);
  return deletedCount;
}

// Groups API
async function addGroup(groupId) {
  const db = readDB();
  if (!db.groups) db.groups = [];
  if (!db.groups.includes(groupId)) {
    db.groups.push(groupId);
    if (!db.groupNames) db.groupNames = {};
    if (!db.groupNames[groupId]) {
      const count = Object.keys(db.groupNames).length + 1;
      db.groupNames[groupId] = `Gr${String(count).padStart(2, '0')}`;
    }
    writeDB(db);
    return true;
  }
  return false;
}

async function removeGroup(groupId) {
  const db = readDB();
  if (!db.groups) return false;
  const initialLength = db.groups.length;
  db.groups = db.groups.filter(id => id !== groupId);
  writeDB(db);
  return initialLength !== db.groups.length;
}

async function getAllGroups() {
  const db = readDB();
  return db.groups || [];
}

async function setGroupName(groupId, name) {
  const db = readDB();
  if (!db.groupNames) db.groupNames = {};
  db.groupNames[groupId] = name;
  writeDB(db);
}

async function getGroupName(groupId) {
  const db = readDB();
  if (!db.groupNames) return null;
  return db.groupNames[groupId] || null;
}

async function getAllGroupNames() {
  const db = readDB();
  return db.groupNames || {};
}

async function removeGroupCompletely(groupId) {
  const db = readDB();
  let changed = false;
  if (db.groups && db.groups.includes(groupId)) {
    db.groups = db.groups.filter(id => id !== groupId);
    changed = true;
  }
  if (db.groupNames && db.groupNames[groupId]) {
    delete db.groupNames[groupId];
    changed = true;
  }
  if (changed) writeDB(db);
  return changed;
}



// --- Web Users API ---
async function getUsers() {
  const db = readDB();
  const users = db.settings.users || [];
  let modified = false;
  users.forEach(u => {
    if (!u.role) {
      u.role = 'SUPER_ADMIN';
      u.displayName = 'Quản trị viên';
      u.zaloId = '';
      modified = true;
    }
  });
  if (modified) writeDB(db);
  return users;
}

async function getUserByUsername(username) {
  const users = await getUsers();
  return users.find(u => u.username === username);
}

async function createUser(username, passwordHash, recoveryKeyHash, role = 'SUPER_ADMIN', displayName = '', zaloId = '') {
  const db = readDB();
  if (!db.settings.users) db.settings.users = [];
  if (db.settings.users.find(u => u.username === username)) return false;
  
  db.settings.users.push({
    username,
    passwordHash,
    recoveryKeyHash,
    role,
    displayName,
    zaloId,
    createdAt: Date.now()
  });
  writeDB(db);
  return true;
}

async function deleteUser(username) {
  const db = readDB();
  if (!db.settings.users) return false;
  const initialLength = db.settings.users.length;
  db.settings.users = db.settings.users.filter(u => u.username !== username);
  if (db.settings.users.length !== initialLength) {
    writeDB(db);
    return true;
  }
  return false;
}

async function updateUserPassword(username, newPasswordHash) {
  const db = readDB();
  if (!db.settings.users) return false;
  const user = db.settings.users.find(u => u.username === username);
  if (user) {
    user.passwordHash = newPasswordHash;
    writeDB(db);
    return true;
  }
  return false;
}

async function updateUser(username, updateData) {
  const db = readDB();
  if (!db.settings.users) return false;
  const user = db.settings.users.find(u => u.username === username);
  if (user) {
    if (updateData.passwordHash) user.passwordHash = updateData.passwordHash;
    if (updateData.role) user.role = updateData.role;
    if (updateData.displayName) user.displayName = updateData.displayName;
    if (updateData.zaloId !== undefined) user.zaloId = updateData.zaloId;
    writeDB(db);
    return true;
  }
  return false;
}

module.exports = {
  getSetting,
  setSetting,
  registerEmployee,
  getEmployee,
  getAllEmployees,
  recordAttendance,
  setOvertime,
  updateAttendance,
  getAttendanceByDate,
  getAllAttendances,
  deleteAllAttendances,
  addGroup,
  removeGroup,
  removeGroupCompletely,
  getAllGroups,
  setGroupName,
  getGroupName,
  getAllGroupNames,
  getUsers,
  getUserByUsername,
  createUser,
  deleteUser,
  updateUserPassword,
  updateUser
};
