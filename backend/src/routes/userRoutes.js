const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// 所有用户管理路由都需要管理员权限
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);
router.post('/', authenticate, authorize('admin'), userController.createUser);
router.get('/:id', authenticate, authorize('admin'), userController.getUserById);
router.put('/:id', authenticate, authorize('admin'), userController.updateUser);
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);
router.post('/:id/reset-password', authenticate, authorize('admin'), userController.resetPassword);

module.exports = router;