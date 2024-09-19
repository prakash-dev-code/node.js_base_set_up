const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../models/tourModel');
const AppError = require('../utils/appError');

exports.checkoutSession = catchAsync(async (req, res, next) => {
  // 1. // get the current tour
  let currentTour = await Tour.findById(req.params.tourId);

  if (!currentTour) {
    return next(new AppError(`No Tour found with that ID`, 404));
  }

  const doc = await currentTour;


  //   2.// create checkout session

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],

    success_url: `${req.protocol}://${req.get('host')}/tour/${
      doc._id
    }?paymentSuccess=true`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${doc._id}`,

    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: doc.name,
            description: doc.summary,
            images: [`https://www.natours.dev/img/tours/${doc.imageCover}`],
          },
          unit_amount: doc.price * 100, // price in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment', // Ensures it's a one-time payment
  });

  //   3  create checkour session response

  res.status(200).json({
    status: 'success',
    data: {
      session,
    },
  });
});
