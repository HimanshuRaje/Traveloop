import mongoose from 'mongoose';

const sharedTripSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    shareSlug: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

sharedTripSchema.index({ shareSlug: 1 });

const SharedTrip = mongoose.model('SharedTrip', sharedTripSchema);
export default SharedTrip;
