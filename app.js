const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const app = express();
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

// Global middleware

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Midddeware

//1. set security for HTTP requests with helmet
app.use(helmet());

// check development environment

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 2. rate limits form same IP per request

const limiter = rateLimit({
  max: 100, // limit each IP to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 60 minutes
  message: 'Too many requests from this IP, please try again in an hour.',
});

app.use('/api', limiter);

// 4. Body parser to read data from body as req.body

// 5. prevent the parameter pullution

app.use(hpp());

//  serve static files from the public directory
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  // console.log(req.headers)

  next();
});
// Midddeware

const homePage = (req, res) => {
  res.status(200).send({
    message: 'Hello server , Its a HOME page!',
    sourcePath: '/',
  });
};

// ROUTES HANDLESRS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.get('/', homePage);
// app.get('/tour', TourPage);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find the ${req.originalUrl} on this server`, 404));
});

// custom error handler middleware start

app.use(globalErrorHandler);
// custom error handler middleware end

// START SERVER

module.exports = app;
