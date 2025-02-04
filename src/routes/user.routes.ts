import express from 'express';
import { UserController } from '../controllers/user.controller';
import { 
  authenticate, 
  isSuperAdmin, 
  isSubAdmin
} from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/login', UserController.loginUser);

// Protected routes
router.use(authenticate);

// Search users (must be before /:id route to avoid conflict)
router.get('/search', isSubAdmin, UserController.searchUsers);

// User CRUD operations
router.post('/', isSuperAdmin, UserController.createUser);
router.get('/', isSubAdmin, UserController.getUsers);
router.get('/category/:category', isSubAdmin, UserController.getUsersByCategory);
router.get('/:id', isSubAdmin, UserController.getUserById);
router.put('/:id', isSuperAdmin, UserController.updateUser);
router.delete('/:id', isSuperAdmin, UserController.deleteUser);

// Add batch management routes for students
router.post('/:id/batches', isSuperAdmin, UserController.assignBatches);
router.get('/:id/batches', isSubAdmin, UserController.getStudentBatches);

export default router;