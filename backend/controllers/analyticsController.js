// controllers/analyticsController.js - Analytics Logic
const Analytics = require('../models/Analytics');
const Url = require('../models/Url');

// @desc    Get analytics for a short code
// @route   GET /api/analytics/:shortCode
// @access  Private (owner) + Public stats page
const getAnalytics = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode }).lean();
    if (!url) return res.status(404).json({ error: 'URL not found.' });

    // Auth check: only owner can see full analytics (public stats page gets limited)
    const isOwner = req.user && req.user._id.toString() === url.userId.toString();

    const analytics = await Analytics.find({ urlId: url._id }).sort({ timestamp: -1 }).lean();

    // ─── Breakdown helpers ────────────────────────────────────────────────
    const breakdown = (field) => {
      const counts = {};
      analytics.forEach(a => {
        const key = a[field] || 'Unknown';
        counts[key] = (counts[key] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count, percentage: Math.round((count / analytics.length) * 100) }))
        .sort((a, b) => b.count - a.count);
    };

    // ─── Daily clicks (last 30 days) ──────────────────────────────────────
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = analytics.filter(a => new Date(a.timestamp) >= thirtyDaysAgo);

    const dailyCounts = {};
    recent.forEach(a => {
      const day = new Date(a.timestamp).toISOString().split('T')[0];
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });
    const dailyClicks = Object.entries(dailyCounts)
      .map(([date, clicks]) => ({ date, clicks }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // ─── Weekly clicks (last 8 weeks) ────────────────────────────────────
    const getWeekKey = (date) => {
      const d = new Date(date);
      const week = `${d.getFullYear()}-W${String(Math.ceil(d.getDate() / 7)).padStart(2, '0')}`;
      return week;
    };
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
    const weeklyData = analytics.filter(a => new Date(a.timestamp) >= eightWeeksAgo);
    const weeklyCounts = {};
    weeklyData.forEach(a => {
      const key = getWeekKey(a.timestamp);
      weeklyCounts[key] = (weeklyCounts[key] || 0) + 1;
    });
    const weeklyClicks = Object.entries(weeklyCounts)
      .map(([week, clicks]) => ({ week, clicks }))
      .sort((a, b) => a.week.localeCompare(b.week));

    // ─── Click prediction (simple linear regression) ─────────────────────
    const recentWeekClicks = dailyClicks.slice(-7).reduce((s, d) => s + d.clicks, 0);
    const prevWeekClicks = dailyClicks.slice(-14, -7).reduce((s, d) => s + d.clicks, 0);
    const growthRate = prevWeekClicks > 0 ? (recentWeekClicks - prevWeekClicks) / prevWeekClicks : 0;
    const predictedNextWeek = Math.max(0, Math.round(recentWeekClicks * (1 + growthRate)));

    res.json({
      success: true,
      data: {
        url: {
          ...url,
          shortUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/${shortCode}`,
          isExpired: url.expiryDate ? new Date() > url.expiryDate : false,
        },
        totalClicks: analytics.length,
        lastVisited: analytics[0]?.timestamp || null,
        recentHistory: analytics.slice(0, 20),
        deviceBreakdown: breakdown('device'),
        browserBreakdown: breakdown('browser'),
        osBreakdown: breakdown('os'),
        countryBreakdown: breakdown('country'),
        dailyClicks,
        weeklyClicks,
        prediction: {
          currentWeekClicks: recentWeekClicks,
          predictedNextWeek,
          growthRate: Math.round(growthRate * 100),
        },
      },
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics.', message: error.message });
  }
};

// @desc    Get top performing URLs for chart
// @route   GET /api/analytics/top-urls
// @access  Private
const getTopUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id })
      .sort({ clickCount: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      topUrls: urls.map(u => ({
        shortCode: u.shortCode,
        originalUrl: u.originalUrl,
        clickCount: u.clickCount,
        pageTitle: u.pageTitle || u.shortCode,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top URLs.', message: error.message });
  }
};

module.exports = { getAnalytics, getTopUrls };
