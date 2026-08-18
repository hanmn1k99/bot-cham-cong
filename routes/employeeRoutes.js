const express = require('express');
const router = express.Router();
const db = require('../database');
const { checkAuth } = require('../middleware/authMiddleware');
const { getEmployeeHtml } = require('../views/employeeView');

router.get('/employees', checkAuth, async (req, res) => {
    const html = await getEmployeeHtml(req.user);
    res.send(html);
});

router.delete('/api/employees/:zaloId', checkAuth, async (req, res) => {
    const zaloId = req.params.zaloId;
    const deleteHistory = req.body.deleteHistory || false;
    
    const success = await db.deleteEmployee(zaloId, deleteHistory);
    if (success) {
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Không tìm thấy nhân viên' });
    }
});

module.exports = router;
