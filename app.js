const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const webVersionRouter = require('./api/webVersionControl');
const gameRouter = require('./api/gameRoutes');
const userRouter = require('./api/userRoutes');
const adminRouter = require('./api/adminRoutes');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));

// 连接MongoDB
mongoose.connect('mongodb://localhost:27017/card_game_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB连接成功'))
.catch(err => console.error('MongoDB连接失败:', err));

// API路由
app.use('/api/web-version', webVersionRouter);
app.use('/api/games', gameRouter);
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);

// 前端路由处理
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = app;
