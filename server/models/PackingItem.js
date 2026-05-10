import mongoose from 'mongoose';

const packingItemSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['clothes', 'documents', 'electronics', 'toiletries', 'medicine', 'accessories', 'other'],
      default: 'other',
    },
    isPacked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

packingItemSchema.index({ trip: 1, category: 1 });

const PackingItem = mongoose.model('PackingItem', packingItemSchema);
export default PackingItem;
