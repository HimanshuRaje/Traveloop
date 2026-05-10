import JournalNote from '../models/JournalNote.js';

export const getNotes = async (req, res, next) => {
  try {
    const notes = await JournalNote.find({ trip: req.params.tripId }).sort('-date');
    res.json({ success: true, notes });
  } catch (error) {
    next(error);
  }
};

export const addNote = async (req, res, next) => {
  try {
    const note = await JournalNote.create({ trip: req.params.tripId, ...req.body });
    res.status(201).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const note = await JournalNote.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    await JournalNote.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
};
