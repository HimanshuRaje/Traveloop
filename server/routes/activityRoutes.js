import express from 'express';
import { updateActivity, deleteActivity, exploreActivities } from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/explore', protect, exploreActivities);
router.route('/:id').put(protect, updateActivity).delete(protect, deleteActivity);

export default router;
