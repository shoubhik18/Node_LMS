import express from 'express';
import { CourseController } from '../controllers/course.controller';

const router = express.Router();

// Course routes
router.post('/', CourseController.createCourse);
router.get('/', CourseController.getCourses);
router.get('/:id', CourseController.getCourseById);
router.put('/:id', CourseController.updateCourse); // Update course
router.delete('/:id', CourseController.deleteCourse); // Delete course

export default router;