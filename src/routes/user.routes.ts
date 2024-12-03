import express from 'express';
import { UserController } from '../controllers/user.controller';

const router = express.Router();

// User routes
router.post('/', UserController.createUser);
router.post('/login', UserController.loginUser);
router.get('/', UserController.getUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;