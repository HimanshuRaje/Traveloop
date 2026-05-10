import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    cityStop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CityStop',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Activity name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['adventure', 'sightseeing', 'food', 'nightlife', 'shopping', 'culture', 'nature', 'wellness'],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    cost: {
      type: Number,
      default: 0,
    },
    duration: {
      type: String,
      default: '1-2 hours',
    },
    rating: {
      type: Number,
      default: 4.0,
      min: 0,
      max: 5,
    },
    location: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

activitySchema.index({ cityStop: 1 });
activitySchema.index({ category: 1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
