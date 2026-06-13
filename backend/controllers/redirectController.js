// controllers/redirectController.js - Short URL Redirect Logic
const UAParser = require('ua-parser-js');
const Url = require('../models/Url');
const Analytics = require('../models/Analytics');

// Simple IP to Country (using free ipapi.co – no key needed for limited use)
const getCountry = async (ip) => {
  try {
    if (!ip || ip === '::1' || ip === '127.0.0.1') return 'Local';
    const axios = require('axios');
    const response = await axios.get(`https://ipapi.co/${ip}/country_name/`, { timeout: 3000 });
    return response.data || 'Unknown';
  } catch {
    return 'Unknown';
  }
};

// @desc    Redirect to original URL + track analytics
// @route   GET /:shortCode
const redirect = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find URL
    const url = await Url.findOne({ shortCode });
    if (!url) {
      // Redirect to frontend 404 page
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/404`);
    }

    // Check expiry
    if (url.expiryDate && new Date() > url.expiryDate) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/expired?code=${shortCode}`);
    }

    // Parse user agent
    const parser = new UAParser(req.headers['user-agent']);
    const result = parser.getResult();
    const browser = result.browser.name || 'Unknown';
    const os = result.os.name || 'Unknown';
    const deviceType = result.device.type || 'Desktop';
    const device = deviceType.charAt(0).toUpperCase() + deviceType.slice(1);

    // Get IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.connection?.remoteAddress || req.ip;

    // Country lookup (async, non-blocking)
    const country = await getCountry(ip);

    // Save analytics (fire and forget won't block redirect)
    Analytics.create({
      urlId: url._id,
      shortCode,
      browser,
      device,
      os,
      country,
      ip,
      referrer: req.headers.referer || null,
    }).catch(err => console.error('Analytics save error:', err));

    // Increment click count + update last visited
    await Url.findByIdAndUpdate(url._id, {
      $inc: { clickCount: 1 },
      lastVisited: new Date(),
    });

    // Redirect to original URL
    res.redirect(301, url.originalUrl);
  } catch (error) {
    console.error('Redirect Error:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/error`);
  }
};

module.exports = { redirect };
