import express from 'express';
import { CourseController } from '../controllers/course.controller';
import { authenticate, isSuperAdmin, isSubAdmin } from '../middleware/auth';

const router = express.Router();

// Protected routes
router.use(authenticate);

// Course CRUD operations
router.post('/', isSuperAdmin, CourseController.createCourse);
router.get('/', isSubAdmin, CourseController.getCourses);
router.get('/:id', isSubAdmin, CourseController.getCourseById);
router.put('/:id', isSuperAdmin, CourseController.updateCourse);
router.delete('/:id', isSuperAdmin, CourseController.deleteCourse);

export default router; 