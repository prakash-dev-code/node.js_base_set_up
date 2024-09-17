const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review must be provided'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Rating must be provided'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// Middleware to populate 'user' field with user's name when finding documents
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

// Middleware to get the review document before 'findOneAnd' (used in update operations)
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.model.findOne(this.getQuery()); // Get the current document
  next();
});

// After the review is updated or deleted, recalculate the tour's average rating
reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) {
    await this.r.constructor.calculateRatingAverage(this.r.tour);
  }
});

// Static method to calculate the average rating of a tour
reviewSchema.statics.calculateRatingAverage = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    // Set default values if no reviews are left
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5, // Default average rating if no reviews
    });
  }
};

// After a new review is saved, update the tour's average rating
reviewSchema.post('save', function () {
  this.constructor.calculateRatingAverage(this.tour);
});

module.exports = mongoose.model('Review', reviewSchema);
