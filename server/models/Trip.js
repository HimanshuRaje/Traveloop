import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    travelStyle: {
      type: String,
      enum: ['budget', 'luxury', 'adventure', 'cultural', 'relaxation', 'backpacking', 'family', 'romantic'],
      default: 'budget',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareSlug: {
      type: String,
      unique: true,
      sparse: true,
    },
    totalBudget: {
      type: Number,
      default: 0,
    },
    cityCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['planning', 'ongoing', 'completed', 'cancelled'],
      default: 'planning',
    },
    bookmarked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

tripSchema.index({ user: 1, createdAt: -1 });
tripSchema.index({ shareSlug: 1 });

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
