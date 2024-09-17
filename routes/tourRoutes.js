const express = require('express');
const multer = require('multer');
const tourController = require('../controller/tourController');
const authController = require('./../controller/authController');
const reviewRoute = require('./../routes/reviewRoutes');

const tourRouter = express.Router();



// tourRouter.param('id', tourController.checkId);

// get review based on specefic tour id

tourRouter.use('/:tourId/reviews', reviewRoute);

// find tour by lat and longitude

tourRouter
  .route('/tour-near-me/:distance/center/:latlng/unit/:unit')
  .get(tourController.tourNearMe);
// find tour by lat and longitude

// get review based on specefic tour id
tourRouter
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.creteTour);
tourRouter.route('/get-stats').get(tourController.getTourStats);

tourRouter
  .route('/:id')
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.ristrictTour('admin', 'member'),
    tourController.deleteTour
  );

// tourRouter
//   .route('/:tourId/reviews')
//   .get(reviewController.getReviews)
//   .post(
//     authController.protect,
//     authController.ristrictTour('user'),
//     reviewController.createReviews
//   );

module.exports = tourRouter;
