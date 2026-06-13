// routes/urlRoutes.js
const express = require('express');
const router = express.Router();
const { createUrl, getAllUrls, getUrlById, updateUrl, deleteUrl, getDashboardStats, getQrCode } = require('../controllers/urlController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All URL routes require auth

router.post('/create', createUrl);
router.get('/all', getAllUrls);
router.get('/stats/summary', getDashboardStats);
router.get('/:id/qr', getQrCode);
router.get('/:id', getUrlById);
router.put('/:id', updateUrl);
router.delete('/:id', deleteUrl);

module.exports = router;
