const Review = require('../models/reviewModel');
const Factory = require('./handlerFactory');
// const AppError = require('./../utils/appError');

exports.getReviews = Factory.getAll(Review);

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getReview = Factory.getOne(Review);
exports.createReviews = Factory.creteOne(Review);
exports.deleteReviews = Factory.deleteOne(Review);
exports.updateReview = Factory.updateOne(Review);
