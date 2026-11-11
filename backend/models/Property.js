const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    isSample: {
      type: Boolean,
      default: false,
      select: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    propertyType: {
      type: String,
      required: true,
      trim: true,
    },
    listingType: {
      type: String,
      required: true,
      trim: true,
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    area: {
      type: Number,
      required: true,
      min: 1,
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    agent: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

propertySchema.index({ price: 1 });
propertySchema.index({ city: 1 });
propertySchema.index({ listingType: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ bedrooms: 1 });
propertySchema.index({ bathrooms: 1 });
propertySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Property', propertySchema);
