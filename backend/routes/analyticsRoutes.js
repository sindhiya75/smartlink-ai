// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { getAnalytics, getTopUrls } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Public stats page (no auth required – owner check done in controller)
router.get('/public/:shortCode', getAnalytics);
// Protected analytics
router.get('/top-urls', protect, getTopUrls);
router.get('/:shortCode', protect, getAnalytics);

module.exports = router;
