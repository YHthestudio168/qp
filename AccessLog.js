const mongoose = require('mongoose');

const AccessLogSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  path: {
    type: String
  },
  method: {
    type: String
  },
  statusCode: {
    type: Number
  }
});

module.exports = mongoose.model('AccessLog', AccessLogSchema);
