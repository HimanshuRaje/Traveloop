import Budget from '../models/Budget.js';
import AppError from '../utils/AppError.js';

export const getBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findOne({ trip: req.params.tripId });
    if (!budget) {
      budget = await Budget.create({ trip: req.params.tripId });
    }
    res.json({ success: true, budget });
  } catch (error) {
    next(error);
  }
};

export const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { trip: req.params.tripId },
      req.body,
      { new: true, runValidators: true, upsert: true }
    );
    res.json({ success: true, budget });
  } catch (error) {
    next(error);
  }
};
