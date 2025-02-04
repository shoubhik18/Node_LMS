import express from 'express';
import { BatchController } from '../controllers/batch.controller';
import { authenticate, isSuperAdmin, isSubAdmin } from '../middleware/auth';

const router = express.Router();

// Protected routes
router.use(authenticate);

// Batch CRUD operations
router.post('/', isSuperAdmin, BatchController.createBatch);
router.get('/', isSubAdmin, BatchController.getBatches);
router.get('/:id', isSubAdmin, BatchController.getBatchById);
router.put('/:id', isSuperAdmin, BatchController.updateBatch);
router.delete('/:id', isSuperAdmin, BatchController.deleteBatch);

export default router; 