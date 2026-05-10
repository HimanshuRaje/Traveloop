import express from 'express';
import { updateCityStop, deleteCityStop, searchCities } from '../controllers/cityController.js';
import { addActivity, getActivities } from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', protect, searchCities);
router.route('/:id').put(protect, updateCityStop).delete(protect, deleteCityStop);
router.route('/:cityStopId/activities').get(protect, getActivities).post(protect, addActivity);

export default router;
