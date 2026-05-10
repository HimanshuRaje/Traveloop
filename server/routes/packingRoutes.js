import express from 'express';
import { getPackingItems, addPackingItem, togglePacked, deletePackingItem, resetChecklist } from '../controllers/packingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/:tripId').get(protect, getPackingItems).post(protect, addPackingItem);
router.put('/:tripId/reset', protect, resetChecklist);
router.route('/item/:id').put(protect, togglePacked).delete(protect, deletePackingItem);

export default router;
