import { Request, Response } from 'express';
import Course from '../models/course.model';
import Chapter from '../models/chapter.model';
import Session from '../models/session.model';
import { Optional } from 'sequelize';
import { Identifier } from 'sequelize';

export class CourseController {
  static async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const { courseName, trainerName, chapters } = req.body; // Expecting chapters to be an array
      const course = await Course.create({ courseName, trainerName });

      // Create chapters if provided
      if (chapters && Array.isArray(chapters)) {
        const chapterPromises = chapters.map(async (chapter) => {
          const createdChapter = await Chapter.create({ ...chapter, courseId: course.id });
          // Create sessions if provided
          if (chapter.sessions && Array.isArray(chapter.sessions)) {
            const sessionPromises = chapter.sessions.map((session: Optional<any, string> | undefined) => 
              Session.create({ ...session, chapterId: createdChapter.id })
            );
            await Promise.all(sessionPromises);
          }
          return createdChapter;
        });
        await Promise.all(chapterPromises);
      }

      res.status(201).json(course);
    } catch (error) {
      console.error('Error in createCourse:', error);
      res.status(500).json({ error: 'Error creating course' });
    }
  }

  static async getCourses(req: Request, res: Response): Promise<void> {
    try {
      const courses = await Course.findAll({ include: Chapter });
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching courses' });
    }
  }

  static async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const course = await Course.findByPk(id, {
        include: [
          {
            model: Chapter,
            include: [Session] // Correctly include Session as an array
          }
        ]
      });
      if (course) {
        res.json(course);
      } else {
        res.status(404).json({ error: 'Course not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error fetching course' });
    }
  }

  static async updateCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { courseName, trainerName, chapters } = req.body;
      const course = await Course.findByPk(id);
      if (course) {
        course.courseName = courseName;
        course.trainerName = trainerName;
        await course.save();

        // Update chapters if provided
        if (chapters && Array.isArray(chapters)) {
          const chapterPromises = chapters.map(async (chapter) => {
            const existingChapter = await Chapter.findByPk(chapter.id);
            if (existingChapter) {
              existingChapter.chapterName = chapter.chapterName;
              await existingChapter.save();

              // Update sessions if provided
              if (chapter.sessions && Array.isArray(chapter.sessions)) {
                const sessionPromises = chapter.sessions.map(async (session: { id: Identifier | undefined; sessionName: string; sessionLink: string; }) => {
                  const existingSession = await Session.findByPk(session.id);
                  if (existingSession) {
                    existingSession.sessionName = session.sessionName;
                    existingSession.sessionLink = session.sessionLink;
                    await existingSession.save();
                  }
                });
                await Promise.all(sessionPromises);
              }
            }
          });
          await Promise.all(chapterPromises);
        }

        res.json(course);
      } else {
        res.status(404).json({ error: 'Course not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error updating course' });
    }
  }

  static async deleteCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const course = await Course.findByPk(id);
      if (course) {
        await course.destroy();
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Course not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error deleting course' });
    }
  }
}