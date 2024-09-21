const express = require('express');
const bookingController = require('../controller/bookingController');
const authController = require('./../controller/authController');

const bookingRouter = express.Router();
bookingRouter.use(authController.protect);

bookingRouter.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.checkoutSession
);

bookingRouter
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

bookingRouter
  .route('/:id')
  .post(bookingController.deleteBooking)
  .patch(bookingController.updateBooking);

module.exports = bookingRouter;
