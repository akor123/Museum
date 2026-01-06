const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名：时间戳 + 随机数 + 原扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的图片格式
  const allowedTypes = /jpeg|jpg|png|gif|webp|bmp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件 (jpeg, jpg, png, gif, webp, bmp)'), false);
  }
};

// 创建upload实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  }
});

// 单文件上传
exports.uploadImage = [
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请选择要上传的图片'
        });
      }

      // 生成访问URL
      const imageUrl = `/uploads/${req.file.filename}`;
      
      res.json({
        success: true,
        data: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: imageUrl
        },
        message: '图片上传成功'
      });
    } catch (error) {
      console.error('上传图片错误:', error);
      res.status(500).json({
        success: false,
        message: '上传图片失败: ' + error.message
      });
    }
  }
];

// 获取图片列表
exports.getImages = async (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    const images = files
      .filter(file => /\.(jpeg|jpg|png|gif|webp|bmp)$/i.test(file))
      .map(file => ({
        filename: file,
        url: `/uploads/${file}`,
        path: path.join(uploadDir, file),
        size: fs.statSync(path.join(uploadDir, file)).size,
        created: fs.statSync(path.join(uploadDir, file)).birthtime
      }));
    
    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('获取图片列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取图片列表失败'
    });
  }
};

// 删除图片
exports.deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '图片不存在'
      });
    }
    
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: '图片删除成功'
    });
  } catch (error) {
    console.error('删除图片错误:', error);
    res.status(500).json({
      success: false,
      message: '删除图片失败'
    });
  }
};