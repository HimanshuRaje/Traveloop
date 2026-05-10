import mongoose from 'mongoose';

const cityStopSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    cityName: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    popularity: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    costIndex: {
      type: String,
      enum: ['$', '$$', '$$$', '$$$$'],
      default: '$$',
    },
  },
  { timestamps: true }
);

cityStopSchema.index({ trip: 1, order: 1 });

const CityStop = mongoose.model('CityStop', cityStopSchema);
export default CityStop;
