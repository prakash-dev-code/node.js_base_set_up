const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true, //Should not be same
      maxlength: [20, 'Name should not exceed 20 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a Group size'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => {
        Math.round(val * 10) / 10;
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    priceDiscount: Number,
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    // duration: Number,
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1 });
tourSchema.index({startLocation:"2dsphere"})

tourSchema.virtual('durationWeeks').get(function () {
  return (this.duration / 7).toFixed(2);
});

// virtual populate (connnectting to child)

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
// schema for tour

// reference type example of guides in this model

// tourSchema.pre('save', async function (next) {
//   try {
//     const guidePromises = this.guides.map(async (item) => {
//       const user = await User.findById(item); // Ensure `item.id` is correct
//       if (!user) {
//         throw new Error(`User with ID ${item.id} not found`);
//       }
//       return user;
//     });

//     this.guides = await Promise.all(guidePromises);

//     next();
//   } catch (err) {
//     next(err); // Pass the error to the next middleware
//   }
// });

// Database middleware

// query for guides as middleware

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-passwordResetToken -__v -passwordResetExpires -passwordChangedAt',
  });
  next();
});

// document middleware ITS worked before .save() and create method
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lowercase: true });
  next();
});
// document middleware  ITS worked before .save() and create method

//query middleware

//query middleware
// Database middleware

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
