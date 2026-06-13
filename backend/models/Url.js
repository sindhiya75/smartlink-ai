// models/Url.js - URL Schema
const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customAlias: {
      type: String,
      trim: true,
      sparse: true, // allows multiple null values
    },
    // AI-generated fields
    aiSummary: {
      type: String,
      default: null,
    },
    pageTitle: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      default: 'Uncategorized',
    },
    // Safety scoring
    safetyScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    safetyDetails: {
      hasHttps: Boolean,
      suspiciousKeywords: Boolean,
      ipBasedDomain: Boolean,
      urlLength: String,
    },
    // Stats
    clickCount: {
      type: Number,
      default: 0,
    },
    // Link expiry
    expiryDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastVisited: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Virtual: check if expired
urlSchema.virtual('isExpired').get(function () {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

urlSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Url', urlSchema);
