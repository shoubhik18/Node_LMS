import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';

const router = Router();

router.post('/', SessionController.createSessions); // Create multiple sessions under a chapter
router.get('/', SessionController.getSessions); // Get all sessions
router.get('/:id', SessionController.getSessionById); // Get session by ID
router.put('/:id', SessionController.updateSession); // Update session
router.delete('/:id', SessionController.deleteSession); // Delete session

export default router;