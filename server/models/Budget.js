import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      unique: true,
    },
    transport: {
      type: Number,
      default: 0,
    },
    hotels: {
      type: Number,
      default: 0,
    },
    food: {
      type: Number,
      default: 0,
    },
    activities: {
      type: Number,
      default: 0,
    },
    miscellaneous: {
      type: Number,
      default: 0,
    },
    totalEstimated: {
      type: Number,
      default: 0,
    },
    totalBudget: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    dailyBudget: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

budgetSchema.pre('save', function (next) {
  this.totalEstimated = this.transport + this.hotels + this.food + this.activities + this.miscellaneous;
  next();
});

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
