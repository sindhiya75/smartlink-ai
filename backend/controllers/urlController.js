// controllers/urlController.js - URL CRUD Logic
const validator = require('validator');
const QRCode = require('qrcode');
const Url = require('../models/Url');
const Analytics = require('../models/Analytics');
const { generateAiSummary, calculateSafetyScore } = require('../services/aiService');

// Generate random short code
const generateShortCode = (length = 6) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Ensure unique short code
const getUniqueShortCode = async (customAlias) => {
  if (customAlias) {
    const exists = await Url.findOne({ shortCode: customAlias });
    if (exists) throw new Error('This custom alias is already taken. Please choose another.');
    return customAlias;
  }
  let code;
  let attempts = 0;
  do {
    code = generateShortCode();
    attempts++;
    if (attempts > 10) throw new Error('Could not generate unique short code. Try again.');
  } while (await Url.findOne({ shortCode: code }));
  return code;
};

// @desc    Create shortened URL
// @route   POST /api/url/create
// @access  Private
const createUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias, expiryDate } = req.body;

    // Validate URL
    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required.' });
    }
    if (!validator.isURL(originalUrl, { require_protocol: true })) {
      return res.status(400).json({ error: 'Invalid URL. Please include http:// or https://' });
    }

    // Validate custom alias
    if (customAlias && !/^[a-zA-Z0-9-_]{3,30}$/.test(customAlias)) {
      return res.status(400).json({ error: 'Custom alias must be 3-30 characters (letters, numbers, hyphens, underscores).' });
    }

    // Get unique short code
    const shortCode = await getUniqueShortCode(customAlias);

    // Run AI + Safety concurrently (non-blocking)
    const [aiData, safetyData] = await Promise.all([
      generateAiSummary(originalUrl),
      Promise.resolve(calculateSafetyScore(originalUrl)),
    ]);

    // Create URL document
    const newUrl = await Url.create({
      userId: req.user._id,
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      pageTitle: aiData.pageTitle,
      aiSummary: aiData.aiSummary,
      category: aiData.category,
      safetyScore: safetyData.safetyScore,
      safetyDetails: safetyData.safetyDetails,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    });

    // Generate QR code as data URL
    const shortUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/${shortCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(shortUrl, { width: 300, margin: 2 });

    res.status(201).json({
      success: true,
      message: 'URL shortened successfully!',
      url: { ...newUrl.toJSON(), shortUrl, qrCode: qrCodeDataUrl },
    });
  } catch (error) {
    console.error('Create URL Error:', error);
    res.status(error.message.includes('alias') ? 409 : 500).json({ error: error.message });
  }
};

// @desc    Get all URLs for logged-in user
// @route   GET /api/url/all
// @access  Private
const getAllUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();

    const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
    const enriched = urls.map(url => ({
      ...url,
      shortUrl: `${BASE_URL}/${url.shortCode}`,
      isExpired: url.expiryDate ? new Date() > url.expiryDate : false,
    }));

    res.json({ success: true, count: enriched.length, urls: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch URLs.', message: error.message });
  }
};

// @desc    Get single URL by ID
// @route   GET /api/url/:id
// @access  Private
const getUrlById = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!url) return res.status(404).json({ error: 'URL not found.' });

    const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
    const shortUrl = `${BASE_URL}/${url.shortCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(shortUrl, { width: 300, margin: 2 });

    res.json({ success: true, url: { ...url, shortUrl, qrCode: qrCodeDataUrl } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch URL.', message: error.message });
  }
};

// @desc    Update URL destination
// @route   PUT /api/url/:id
// @access  Private
const updateUrl = async (req, res) => {
  try {
    const { originalUrl, expiryDate } = req.body;

    if (originalUrl && !validator.isURL(originalUrl, { require_protocol: true })) {
      return res.status(400).json({ error: 'Invalid URL format.' });
    }

    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) return res.status(404).json({ error: 'URL not found.' });

    if (originalUrl) url.originalUrl = originalUrl;
    if (expiryDate !== undefined) url.expiryDate = expiryDate ? new Date(expiryDate) : null;

    await url.save();
    res.json({ success: true, message: 'URL updated successfully.', url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update URL.', message: error.message });
  }
};

// @desc    Delete URL and its analytics
// @route   DELETE /api/url/:id
// @access  Private
const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) return res.status(404).json({ error: 'URL not found.' });

    // Delete associated analytics
    await Analytics.deleteMany({ urlId: url._id });
    await url.deleteOne();

    res.json({ success: true, message: 'URL deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete URL.', message: error.message });
  }
};

// @desc    Dashboard summary stats
// @route   GET /api/url/stats/summary
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const urls = await Url.find({ userId }).lean();
    const totalUrls = urls.length;
    const totalClicks = urls.reduce((sum, u) => sum + u.clickCount, 0);
    const mostClicked = urls.sort((a, b) => b.clickCount - a.clickCount)[0] || null;

    // Today's clicks
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const urlIds = urls.map(u => u._id);
    const todayClicks = await Analytics.countDocuments({ urlId: { $in: urlIds }, timestamp: { $gte: startOfDay } });

    res.json({
      success: true,
      stats: { totalUrls, totalClicks, todayClicks, mostClicked: mostClicked ? { ...mostClicked, shortUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/${mostClicked.shortCode}` } : null },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats.', message: error.message });
  }
};

// @desc    Get QR code image for a URL (returns PNG buffer)
// @route   GET /api/url/:id/qr
// @access  Private
const getQrCode = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!url) return res.status(404).json({ error: 'URL not found.' });

    const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
    const shortUrl = `${BASE_URL}/${url.shortCode}`;

    // Return as PNG buffer so the browser can display/download it directly
    const qrBuffer = await QRCode.toBuffer(shortUrl, {
      type: 'png',
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });

    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=86400'); // cache 1 day
    res.send(qrBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code.', message: error.message });
  }
};

module.exports = { createUrl, getAllUrls, getUrlById, updateUrl, deleteUrl, getDashboardStats, getQrCode };
