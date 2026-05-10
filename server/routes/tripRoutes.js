import express from 'express';
import { createTrip, getMyTrips, getTrip, updateTrip, deleteTrip, toggleBookmark, shareTrip, getSharedTrip, copyTrip } from '../controllers/tripController.js';
import { addCityStop, getCityStops, reorderCityStops } from '../controllers/cityController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/shared/:slug', getSharedTrip);

router.use(protect);
router.route('/').get(getMyTrips).post(upload.single('coverImage'), createTrip);
router.route('/:id').get(getTrip).put(upload.single('coverImage'), updateTrip).delete(deleteTrip);
router.put('/:id/bookmark', toggleBookmark);
router.post('/:id/share', shareTrip);
router.post('/copy/:slug', copyTrip);

router.route('/:tripId/cities').get(getCityStops).post(addCityStop);
router.put('/:tripId/cities/reorder', reorderCityStops);

export default router;
