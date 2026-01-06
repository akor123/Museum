const express = require('express');
const router = express.Router();
const artifactController = require('../controllers/artifactController');
const { authenticate, authorize } = require('../middleware/auth');

// 公开路由
router.get('/', artifactController.getAllArtifacts);
router.get('/categories', artifactController.getCategories);
router.get('/eras', artifactController.getEras);
router.get('/stats', artifactController.getStats);
router.get('/:id', artifactController.getArtifactById);

// 需要认证的路由
router.post('/', authenticate, authorize('admin', 'curator'), artifactController.createArtifact);
router.put('/:id', authenticate, authorize('admin', 'curator'), artifactController.updateArtifact);
router.delete('/:id', authenticate, authorize('admin'), artifactController.deleteArtifact);

module.exports = router;
