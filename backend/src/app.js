const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const artifactRoutes = require('./routes/artifactRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); 
// 新增：导入用户路由
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 允许访问uploads目录
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 路由
app.use('/api/artifacts', artifactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
// 新增：挂载用户路由
app.use('/api/users', userRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: '博物馆管理系统后端',
    timestamp: new Date().toISOString() 
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '路由不存在'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  
  // Multer文件大小错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: '文件大小不能超过5MB'
    });
  }
  
  // Multer文件类型错误
  if (err.message && err.message.includes('只允许上传图片文件')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

app.listen(PORT, () => {
  console.log(`博物馆管理系统后端运行在 http://localhost:${PORT}`);
  console.log(`API文档:`);
  console.log(`  GET  http://localhost:${PORT}/api/artifacts`);
  console.log(`  POST http://localhost:${PORT}/api/auth/login`);
  // 新增：添加用户路由的API文档日志
  console.log(`  GET  http://localhost:${PORT}/api/users`);
  console.log(`  POST http://localhost:${PORT}/api/upload/image`);
});