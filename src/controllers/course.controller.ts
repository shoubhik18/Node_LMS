import { Request, Response } from 'express';
import { CourseService } from '../services/course.service';
import multer from 'multer';

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'courseCover') {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Please upload an image file for course cover'));
      }
    } else if (file.fieldname === 'item') {
      const itemType = req.body.itemType;
      if (itemType === 'pdf' && !file.originalname.match(/\.pdf$/)) {
        return cb(new Error('Please upload a PDF file'));
      } else if (itemType === 'image' && !file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Please upload an image file'));
      } else if (itemType === 'video' && !file.originalname.match(/\.(mp4|mov)$/)) {
        return cb(new Error('Please upload a video file'));
      }
    }
    cb(null, true);
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
}).fields([
  { name: 'courseCover', maxCount: 1 },
  { name: 'item', maxCount: 1 }
]);

export class CourseController {
  static async createCourse(req: Request, res: Response): Promise<void> {
    try {
      upload(req, res, async (err) => {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        // Convert course cover to base64
        let courseCoverBase64: string | undefined;
        if (files['courseCover']?.[0]) {
          const buffer = files['courseCover'][0].buffer;
          const mimeType = files['courseCover'][0].mimetype;
          courseCoverBase64 = `data:${mimeType};base64,${buffer.toString('base64')}`;
        }

        const courseData = {
          ...req.body,
          trainerId: parseInt(req.body.trainerId),
          totalPrice: parseFloat(req.body.totalPrice),
          discountPrice: req.body.discountPrice ? parseFloat(req.body.discountPrice) : undefined,
          courseCover: courseCoverBase64,
          itemUrl: files['item']?.[0]?.path,
          availableFrom: req.body.availableFrom ? new Date(req.body.availableFrom) : undefined,
          availableTo: req.body.availableTo ? new Date(req.body.availableTo) : undefined
        };

        const course = await CourseService.createCourse(courseData);
        res.status(201).json(course);
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getCourses(req: Request, res: Response): Promise<void> {
    try {
      const courses = await CourseService.getCourses();
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const course = await CourseService.getCourseById(id);
      if (course) {
        res.json(course);
      } else {
        res.status(404).json({ error: 'Course not found' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateCourse(req: Request, res: Response): Promise<void> {
    try {
      upload(req, res, async (err) => {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }

        const id = parseInt(req.params.id);
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        // Convert new course cover to base64 if provided
        let courseCoverBase64: string | undefined;
        if (files['courseCover']?.[0]) {
          const buffer = files['courseCover'][0].buffer;
          const mimeType = files['courseCover'][0].mimetype;
          courseCoverBase64 = `data:${mimeType};base64,${buffer.toString('base64')}`;
        }

        const courseData = {
          ...req.body,
          ...(req.body.trainerId && { trainerId: parseInt(req.body.trainerId) }),
          ...(req.body.totalPrice && { totalPrice: parseFloat(req.body.totalPrice) }),
          ...(req.body.discountPrice && { discountPrice: parseFloat(req.body.discountPrice) }),
          ...(courseCoverBase64 && { courseCover: courseCoverBase64 }),
          ...(files['item'] && { itemUrl: files['item'][0].path }),
          ...(req.body.availableFrom && { availableFrom: new Date(req.body.availableFrom) }),
          ...(req.body.availableTo && { availableTo: new Date(req.body.availableTo) })
        };

        const course = await CourseService.updateCourse(id, courseData);
        if (course) {
          res.json(course);
        } else {
          res.status(404).json({ error: 'Course not found' });
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteCourse(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const success = await CourseService.deleteCourse(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Course not found' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
} 