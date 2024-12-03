import { Router } from 'express';
import { ChapterController } from '../controllers/chapter.controller';

const router = Router();

router.post('/', ChapterController.createChapter); // Create chapter and sessions
router.get('/', ChapterController.getChapters); // Get all chapters
router.get('/:id', ChapterController.getChapterById); // Get chapter by ID
router.put('/:id', ChapterController.updateChapter); // Update chapter
router.delete('/:id', ChapterController.deleteChapter); // Delete chapter

export default router;