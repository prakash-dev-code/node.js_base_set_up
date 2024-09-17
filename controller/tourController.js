const Tour = require('./../models/tourModel');
const ApiFeature = require('../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const Factory = require('./handlerFactory');

exports.getAllTours = Factory.getAll(Tour);

exports.updateTour = Factory.updateOne(Tour);

exports.deleteTour = Factory.deleteOne(Tour);

exports.getTourById = Factory.getOne(Tour, {
  path: 'reviews',
  strictPopulate: false,
});

exports.creteTour = Factory.creteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4 } },
    },
    { $group: { _id: null, avgRating: { $avg: '$ratingsAverage' } } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.tourNearMe = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const [lat, lng] = latlng.split(',');

  if (!lat && !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  console.log(distance, latlng, unit);

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',

    result: tours.length,

    message: 'This is a test message',

    data: {
      data: tours,
    },
  });
});
