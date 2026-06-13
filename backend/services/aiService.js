// services/aiService.js - OpenRouter AI Integration + Safety Scoring
const axios = require('axios');

// ─── Fetch real page metadata (title + description) ──────────────────────────
const fetchPageMetadata = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 8000,
      maxContentLength: 500000, // only grab first 500KB
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SmartLinkBot/1.0)',
        'Accept': 'text/html',
      },
      // Stop downloading after we have enough HTML for the <head>
      decompress: true,
    });

    const html = response.data;

    // Extract <title>
    const titleMatch = html.match(/<title[^>]*>([^<]{1,200})<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;

    // Extract <meta name="description"> or <meta property="og:description">
    const metaDescMatch =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,300})["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']{1,300})["'][^>]+name=["']description["']/i) ||
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{1,300})["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']{1,300})["'][^>]+property=["']og:description["']/i);
    const description = metaDescMatch ? metaDescMatch[1].trim() : null;

    // Extract og:title as fallback
    const ogTitleMatch =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']{1,200})["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']{1,200})["'][^>]+property=["']og:title["']/i);
    const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : null;

    return {
      title: title || ogTitle || null,
      description: description || null,
    };
  } catch {
    // Silently fail — many sites block bots, that's fine
    return { title: null, description: null };
  }
};

// ─── AI Summary via OpenRouter ────────────────────────────────────────────────
const generateAiSummary = async (url) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        pageTitle: 'AI Summary Unavailable',
        aiSummary: 'Configure GEMINI_API_KEY to enable AI summaries.',
        category: 'Uncategorized',
      };
    }

    // Step 1: Try to fetch real page metadata
    const metadata = await fetchPageMetadata(url);

    // Step 2: Build a richer prompt using real data if available
    let contextInfo = `URL: ${url}`;
    if (metadata.title) contextInfo += `\nPage Title: ${metadata.title}`;
    if (metadata.description) contextInfo += `\nPage Description: ${metadata.description}`;

    const prompt = `Analyze the following webpage information and provide a JSON response with exactly these fields:
- pageTitle: A concise, clean page title (max 60 chars). Use the provided title if good, otherwise improve it.
- aiSummary: A clear 1-2 sentence description of what this page contains (max 150 chars). Use the description if provided.
- category: Pick ONE from [Technology, News, Social Media, E-Commerce, Education, Entertainment, Finance, Health, Travel, Other]

${contextInfo}

Respond with ONLY valid JSON, no markdown, no extra text.`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemma-4-31b-it:free',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 256,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
          'X-Title': 'SmartLink AI',
        },
        timeout: 15000,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content || '{}';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      pageTitle: parsed.pageTitle || metadata.title || extractDomain(url),
      aiSummary: parsed.aiSummary || metadata.description || 'No summary available.',
      category: parsed.category || 'Other',
    };
  } catch (error) {
    console.error('AI Summary Error:', error.message);
    if (error.response) {
      console.error('OpenRouter status:', error.response.status);
      console.error('OpenRouter response:', JSON.stringify(error.response.data));
    }
    // Graceful fallback – don't block URL creation
    return {
      pageTitle: extractDomain(url),
      aiSummary: 'AI summary could not be generated for this URL.',
      category: 'Uncategorized',
    };
  }
};

// ─── Safety Score Calculator ──────────────────────────────────────────────────
const calculateSafetyScore = (url) => {
  let score = 100;
  const details = {
    hasHttps: false,
    suspiciousKeywords: false,
    ipBasedDomain: false,
    urlLength: 'normal',
  };

  try {
    const parsed = new URL(url);

    // Check HTTPS (-20 if not)
    if (parsed.protocol === 'https:') {
      details.hasHttps = true;
    } else {
      score -= 20;
    }

    // Check for suspicious keywords
    const suspiciousWords = ['phish', 'login', 'verify', 'secure', 'account', 'update', 'bank', 'password', 'free', 'prize', 'winner', 'click', 'urgent'];
    const urlLower = url.toLowerCase();
    const hasSuspicious = suspiciousWords.some(word => urlLower.includes(word));
    if (hasSuspicious) {
      details.suspiciousKeywords = true;
      score -= 25;
    }

    // Check for IP-based domain (e.g., http://192.168.1.1/...)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(parsed.hostname)) {
      details.ipBasedDomain = true;
      score -= 30;
    }

    // Check URL length
    if (url.length > 200) {
      details.urlLength = 'very long';
      score -= 15;
    } else if (url.length > 100) {
      details.urlLength = 'long';
      score -= 5;
    } else {
      details.urlLength = 'normal';
    }

    // Extra: multiple subdomains
    const subdomains = parsed.hostname.split('.').length - 2;
    if (subdomains > 2) {
      score -= 10;
    }

  } catch {
    score = 30; // Unparseable URL is suspicious
  }

  return { safetyScore: Math.max(0, Math.min(100, score)), safetyDetails: details };
};

// Helper: extract domain from URL
const extractDomain = (url) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url.slice(0, 30);
  }
};

module.exports = { generateAiSummary, calculateSafetyScore };
