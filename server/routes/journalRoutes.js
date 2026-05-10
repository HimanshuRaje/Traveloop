import express from 'express';
import { getNotes, addNote, updateNote, deleteNote } from '../controllers/journalController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/:tripId').get(protect, getNotes).post(protect, addNote);
router.route('/note/:id').put(protect, updateNote).delete(protect, deleteNote);

export default router;
