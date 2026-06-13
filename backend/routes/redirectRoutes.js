// routes/redirectRoutes.js
const express = require('express');
const router = express.Router();
const { redirect } = require('../controllers/redirectController');

// Must not conflict with /api/* routes
router.get('/:shortCode', (req, res, next) => {
  const { shortCode } = req.params;
  // Skip if looks like an API or frontend route
  if (shortCode.startsWith('api') || shortCode === 'favicon.ico') return next();
  redirect(req, res);
});

module.exports = router;
