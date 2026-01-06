const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticate, authorize } = require('../middleware/auth');

// 图片上传需要认证
router.post('/image', authenticate, authorize('admin', 'curator'), uploadController.uploadImage);
router.get('/images', authenticate, uploadController.getImages);
router.delete('/image/:filename', authenticate, authorize('admin', 'curator'), uploadController.deleteImage);

module.exports = router;