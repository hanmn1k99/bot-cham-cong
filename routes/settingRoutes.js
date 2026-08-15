const express = require('express');
const router = express.Router();
const db = require('../database');
const { checkAuth } = require('../middleware/authMiddleware');
const { getSettingsHtml } = require('../views/settingsView');

// GET /settings
router.get('/settings', checkAuth, async (req, res) => {
  if (req.user.role !== 'SUPER_ADMIN') return res.redirect('/report');
  const html = await getSettingsHtml(req.user);
  if (!html) return res.redirect('/report');
  res.send(html);
});

// POST /api/settings/company
router.post('/api/settings/company', checkAuth, async (req, res) => {
  if (req.user.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Permission denied' });
  const { bot_org_name } = req.body;
  if (bot_org_name !== undefined) await db.setSetting('bot_org_name', bot_org_name.trim());
  res.json({ success: true });
});

module.exports = router;
