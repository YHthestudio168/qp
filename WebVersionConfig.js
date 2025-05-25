const mongoose = require('mongoose');

const WebVersionConfigSchema = new mongoose.Schema({
  enabled: {
    type: Boolean,
    default: true
  },
  availableGames: {
    type: [{
      type: String,
      enum: ['guizhou_mahjong', 'hongzhong_mahjong', 'shisanshui', 'niuniu', 'sangong', 'zhajinhua']
    }],
    default: ['guizhou_mahjong', 'hongzhong_mahjong', 'shisanshui', 'niuniu', 'sangong', 'zhajinhua']
  },
  ipWhitelist: {
    type: [String],
    default: []
  },
  ipBlacklist: {
    type: [String],
    default: []
  },
  timeRestrictions: {
    type: [{
      dayOfWeek: {
        type: [Number],
        default: [0, 1, 2, 3, 4, 5, 6] // 0-6 表示周日到周六
      },
      startTime: String, // 格式: "HH:MM"
      endTime: String    // 格式: "HH:MM"
    }],
    default: []
  },
  maintenanceMessage: {
    type: String,
    default: '网页版正在维护中，请稍后再试。'
  },
  announcements: {
    type: [{
      content: String,
      startDate: Date,
      endDate: Date,
      priority: {
        type: Number,
        default: 0
      }
    }],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时自动更新updatedAt字段
WebVersionConfigSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('WebVersionConfig', WebVersionConfigSchema);
