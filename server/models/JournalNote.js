import mongoose from 'mongoose';

const journalNoteSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    cityStop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CityStop',
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    title: {
      type: String,
      default: '',
    },
    mood: {
      type: String,
      enum: ['happy', 'excited', 'relaxed', 'tired', 'adventurous', 'neutral'],
      default: 'neutral',
    },
  },
  { timestamps: true }
);

journalNoteSchema.index({ trip: 1, date: -1 });

const JournalNote = mongoose.model('JournalNote', journalNoteSchema);
export default JournalNote;
