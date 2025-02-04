import { Request, Response } from 'express';
import { BatchService } from '../services/batch.service';
import multer from 'multer';
import path from 'path';
import { CourseService } from '../services/course.service';

// Configure multer for memory storage instead of disk
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'profileImage') {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Please upload an image file'));
      }
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'studyMaterial', maxCount: 1 }
]);

export class BatchController {
  static async createBatch(req: Request, res: Response): Promise<void> {
    try {
      upload(req, res, async (err) => {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};
        
        // Parse studentIds from the request body
        let studentIds: number[] = [];
        try {
          studentIds = req.body.studentIds ? JSON.parse(req.body.studentIds) : [];
        } catch (error) {
          res.status(400).json({ error: 'Invalid studentIds format' });
          return;
        }

        // Convert image to base64
        let profileImageBase64: string | undefined;
        if (files['profileImage']?.[0]) {
          const buffer = files['profileImage'][0].buffer;
          const mimeType = files['profileImage'][0].mimetype;
          profileImageBase64 = `data:${mimeType};base64,${buffer.toString('base64')}`;
        }

        const batchData = {
          trainerId: parseInt(req.body.trainerId),
          courseId: parseInt(req.body.courseId),
          batchStartDate: new Date(req.body.batchStartDate),
          batchEndDate: new Date(req.body.batchEndDate),
          batchTimings: req.body.batchTimings,
          profileImage: profileImageBase64,
          studyMaterial: files['studyMaterial']?.[0]?.path,
          studentIds
        };

        const batch = await BatchService.createBatch(batchData);
        res.status(201).json(batch);
      });
    } catch (error: any) {
      console.error('Error in createBatch:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getBatches(req: Request, res: Response): Promise<void> {
    try {
      const batches = await BatchService.getBatches();
      res.json(batches);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching batches' });
    }
  }

  static async getBatchById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const batch = await BatchService.getBatchById(id);
      if (batch) {
        res.json(batch);
      } else {
        res.status(404).json({ error: 'Batch not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error fetching batch' });
    }
  }

  static async updateBatch(req: Request, res: Response): Promise<void> {
    try {
      upload(req, res, async (err) => {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }

        const id = parseInt(req.params.id);
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        // Convert new image to base64 if provided
        let profileImageBase64: string | undefined;
        if (files['profileImage']?.[0]) {
          const buffer = files['profileImage'][0].buffer;
          const mimeType = files['profileImage'][0].mimetype;
          profileImageBase64 = `data:${mimeType};base64,${buffer.toString('base64')}`;
        }

        const batchData = {
          ...req.body,
          ...(profileImageBase64 && { profileImage: profileImageBase64 }),
          ...(files['studyMaterial'] && { studyMaterial: files['studyMaterial'][0].path }),
        };

        const batch = await BatchService.updateBatch(id, batchData);
        if (batch) {
          res.json(batch);
        } else {
          res.status(404).json({ error: 'Batch not found' });
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Error updating batch' });
    }
  }

  static async deleteBatch(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const success = await BatchService.deleteBatch(id);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Batch not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error deleting batch' });
    }
  }
} 