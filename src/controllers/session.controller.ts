import { Request, Response } from 'express';
import Session from '../models/session.model';
import { Optional } from 'sequelize';

export class SessionController {
  static async createSessions(req: Request, res: Response): Promise<void> {
    try {
      const { chapterId, sessions } = req.body; // Expecting sessions to be an array
      const sessionPromises = sessions.map((session: Optional<any, string> | undefined) => 
        Session.create({ ...session, chapterId })
      );
      const createdSessions = await Promise.all(sessionPromises);
      res.status(201).json(createdSessions);
    } catch (error) {
      console.error('Error in createSessions:', error);
      res.status(500).json({ error: 'Error creating sessions' });
    }
  }

  static async getSessions(req: Request, res: Response): Promise<void> {
    try {
      const sessions = await Session.findAll();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching sessions' });
    }
  }

  static async getSessionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const session = await Session.findByPk(id);
      if (session) {
        res.json(session);
      } else {
        res.status(404).json({ error: 'Session not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error fetching session' });
    }
  }

  static async updateSession(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { sessionName, sessionLink, chapterId } = req.body;
      const session = await Session.findByPk(id);
      if (session) {
        session.sessionName = sessionName;
        session.sessionLink = sessionLink;
        session.chapterId = chapterId;
        await session.save();
        res.json(session);
      } else {
        res.status(404).json({ error: 'Session not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error updating session' });
    }
  }

  static async deleteSession(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const session = await Session.findByPk(id);
      if (session) {
        await session.destroy();
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Session not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error deleting session' });
    }
  }
}