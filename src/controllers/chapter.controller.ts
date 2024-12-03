import { Request, Response } from 'express';
import Chapter from '../models/chapter.model';
import Session from '../models/session.model';

export class ChapterController {
  static async createChapter(req: Request, res: Response): Promise<void> {
    try {
      const { chapterName, courseId, sessions } = req.body; // Expecting sessions to be an array
      const chapter = await Chapter.create({ chapterName, courseId });

      // Create sessions if provided
      if (sessions && Array.isArray(sessions)) {
        const sessionPromises = sessions.map(session => 
          Session.create({ ...session, chapterId: chapter.id })
        );
        await Promise.all(sessionPromises);
      }

      res.status(201).json(chapter);
    } catch (error) {
      console.error('Error in createChapter:', error);
      res.status(500).json({ error: 'Error creating chapter' });
    }
  }

  static async getChapters(req: Request, res: Response): Promise<void> {
    try {
      const chapters = await Chapter.findAll({ include: Session });
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching chapters' });
    }
  }

  static async getChapterById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const chapter = await Chapter.findByPk(id, { include: Session });
      if (chapter) {
        res.json(chapter);
      } else {
        res.status(404).json({ error: 'Chapter not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error fetching chapter' });
    }
  }

  static async updateChapter(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { chapterName, courseId, sessions } = req.body;
      const chapter = await Chapter.findByPk(id);
      if (chapter) {
        chapter.chapterName = chapterName;
        chapter.courseId = courseId;
        await chapter.save();

        // Update sessions if provided
        if (sessions && Array.isArray(sessions)) {
          const sessionPromises = sessions.map(async (session) => {
            const existingSession = await Session.findByPk(session.id);
            if (existingSession) {
              existingSession.sessionName = session.sessionName;
              existingSession.sessionLink = session.sessionLink;
              await existingSession.save();
            }
          });
          await Promise.all(sessionPromises);
        }

        res.json(chapter);
      } else {
        res.status(404).json({ error: 'Chapter not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error updating chapter' });
    }
  }

  static async deleteChapter(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const chapter = await Chapter.findByPk(id);
      if (chapter) {
        await chapter.destroy();
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Chapter not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error deleting chapter' });
    }
  }
}