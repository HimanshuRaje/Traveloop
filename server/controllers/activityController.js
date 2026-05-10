import Activity from '../models/Activity.js';
import AppError from '../utils/AppError.js';

export const addActivity = async (req, res, next) => {
  try {
    const activity = await Activity.create({
      cityStop: req.params.cityStopId,
      ...req.body,
    });
    res.status(201).json({ success: true, activity });
  } catch (error) {
    next(error);
  }
};

export const getActivities = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { cityStop: req.params.cityStopId };
    if (category) query.category = category;
    const activities = await Activity.find(query);
    res.json({ success: true, activities });
  } catch (error) {
    next(error);
  }
};

export const updateActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!activity) return next(new AppError('Activity not found', 404));
    res.json({ success: true, activity });
  } catch (error) {
    next(error);
  }
};

export const deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) return next(new AppError('Activity not found', 404));
    res.json({ success: true, message: 'Activity deleted' });
  } catch (error) {
    next(error);
  }
};

export const exploreActivities = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    const activities = await Activity.find(query).populate('cityStop', 'cityName country').limit(50);
    res.json({ success: true, activities });
  } catch (error) {
    next(error);
  }
};
