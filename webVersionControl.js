const express = require('express');
const router = express.Router();
const WebVersionConfig = require('../models/WebVersionConfig');
const AccessLog = require('../models/AccessLog');
const { checkAdmin } = require('../utils/auth');
const { checkIPAccess } = require('../utils/network');
const { checkTimeAccess } = require('../utils/datetime');

// 获取网页版状态
router.get('/status', async (req, res) => {
  try {
    const config = await WebVersionConfig.findOne();
    if (!config) {
      return res.status(404).json({ message: '配置未找到' });
    }
    
    // 记录访问日志
    const log = new AccessLog({
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date()
    });
    await log.save();
    
    // 检查是否全局禁用
    if (!config.enabled) {
      return res.json({ 
        enabled: false, 
        message: config.maintenanceMessage || '网页版暂时不可用'
      });
    }
    
    // 检查IP访问权限
    if (!checkIPAccess(req.ip, config.ipWhitelist, config.ipBlacklist)) {
      return res.json({ 
        enabled: false, 
        message: '您的IP地址没有访问权限'
      });
    }
    
    // 检查时间访问权限
    if (!checkTimeAccess(new Date(), config.timeRestrictions)) {
      return res.json({ 
        enabled: false, 
        message: '当前时间段网页版不可用'
      });
    }
    
    // 通过所有检查，返回可用状态
    return res.json({
      enabled: true,
      availableGames: config.availableGames,
      announcements: config.announcements
    });
  } catch (error) {
    console.error('获取网页版状态失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 管理员更新网页版配置
router.put('/config', checkAdmin, async (req, res) => {
  try {
    const {
      enabled,
      availableGames,
      ipWhitelist,
      ipBlacklist,
      timeRestrictions,
      maintenanceMessage,
      announcements
    } = req.body;
    
    let config = await WebVersionConfig.findOne();
    
    if (!config) {
      config = new WebVersionConfig();
    }
    
    // 更新配置
    if (enabled !== undefined) config.enabled = enabled;
    if (availableGames) config.availableGames = availableGames;
    if (ipWhitelist) config.ipWhitelist = ipWhitelist;
    if (ipBlacklist) config.ipBlacklist = ipBlacklist;
    if (timeRestrictions) config.timeRestrictions = timeRestrictions;
    if (maintenanceMessage) config.maintenanceMessage = maintenanceMessage;
    if (announcements) config.announcements = announcements;
    
    await config.save();
    
    res.json({ message: '配置更新成功', config });
  } catch (error) {
    console.error('更新网页版配置失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取访问统计
router.get('/stats', checkAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const logs = await AccessLog.find(query);
    
    // 计算统计数据
    const totalVisits = logs.length;
    const uniqueIPs = new Set(logs.map(log => log.ip)).size;
    
    // 按日期分组
    const visitsByDate = {};
    logs.forEach(log => {
      const date = log.timestamp.toISOString().split('T')[0];
      visitsByDate[date] = (visitsByDate[date] || 0) + 1;
    });
    
    res.json({
      totalVisits,
      uniqueIPs,
      visitsByDate
    });
  } catch (error) {
    console.error('获取访问统计失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
