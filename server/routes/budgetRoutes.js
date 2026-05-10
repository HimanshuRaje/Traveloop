import express from 'express';
import { getBudget, updateBudget } from '../controllers/budgetController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/:tripId').get(protect, getBudget).put(protect, updateBudget);

export default router;
