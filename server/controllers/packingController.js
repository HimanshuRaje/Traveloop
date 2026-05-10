import PackingItem from '../models/PackingItem.js';

export const getPackingItems = async (req, res, next) => {
  try {
    const items = await PackingItem.find({ trip: req.params.tripId }).sort('category');
    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
};

export const addPackingItem = async (req, res, next) => {
  try {
    const item = await PackingItem.create({ trip: req.params.tripId, ...req.body });
    res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

export const togglePacked = async (req, res, next) => {
  try {
    const item = await PackingItem.findById(req.params.id);
    item.isPacked = !item.isPacked;
    await item.save();
    res.json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

export const deletePackingItem = async (req, res, next) => {
  try {
    await PackingItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    next(error);
  }
};

export const resetChecklist = async (req, res, next) => {
  try {
    await PackingItem.updateMany({ trip: req.params.tripId }, { isPacked: false });
    const items = await PackingItem.find({ trip: req.params.tripId });
    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
};
