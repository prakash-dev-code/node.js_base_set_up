const crypto = require('crypto');
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const appError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const jwtToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {

  const token = jwtToken(user._id);

  const cookieOptions ={
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    
    // secure: false, // make it true in production 
    httpOnly: true,
  }

  res.cookie('JWT',token,cookieOptions)
  
  // remove the password from the output

  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body);
  const newUser = await User.create(
    req.body
    // name: req.body.name,
    // email: req.body.email,
    // photo: req.body.photo,
    // password: req.body.password,
    // confirmPassword: req.body.confirmPassword,
    // passwordChangedAt: req.body.passwordChangedAt,
  );

  createSendToken(newUser, 201, res);

  // const token = jwtToken(newUser._id);

  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });
});

exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1.Check if email and password exist in database
  if (!email || !password)
    return next(new appError('Please provide email and password ', 404));

  // 2. find user by email and password

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user?.password))) {
    return next(new appError(' email and password is not found ', 404));
  }
  // 3 if email and password matched in database then send token to client side

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Getting token and checking if it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new appError('You are not authorized', 401));
  }

  try {
    // 2. Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next(new appError('User does not exist anymore', 401));
    }

    // 4. Check if user changed password after JWT token was generated
    if (currentUser.changePasswordAfter(decoded.iat)) {
      return next(
        new appError('Password has been changed, please login again', 401)
      );
    }

    // Grand access

    req.user = currentUser;

    // Add the currentUser to the request object for further middlewares

    next();
  } catch (err) {
    // Handle specific JWT errors or other errors
    if (err.name === 'JsonWebTokenError') {
      return next(new appError('Token is not valid', 401));
    } else if (err.name === 'TokenExpiredError') {
      return next(new appError('Token has expired', 401));
    } else {
      return next(
        new appError('Something went wrong with token verification', 401)
      );
    }
  }
});

// authorized some role to delete a tour

exports.ristrictTour = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new appError('You are not authorized to perform this action', 403)
      );
    }
    next();
  };
};
// authorized some role to delete a tour

// forget password
exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1. get user by Posted  email

  const userByEmail = await User.findOne({ email: req.body.email });

  if (!userByEmail) {
    return next(new appError('No user found with this email', 404));
  }

  // 2. generate random reset token
  const resetToken = userByEmail.createResetPasswordToken();

  console.log(resetToken, 'RESET TOKEN IN AUTH MODULE');

  await userByEmail.save({ validateBeforeSave: false });

  // 3. sent it to user email

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `visit to ${resetURL} if you forget your password`;

  try {
    await sendEmail({
      email: userByEmail.email,
      subject: 'Password Reset Token valid for only 10 minutes',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to your email',
    });
  } catch (error) {
    userByEmail.resetPasswordToken = undefined;
    userByEmail.resetPasswordExpires = undefined;
    await userByEmail.save({ validateBeforeSave: false });
    return next(new appError("Couldn't send email , Try again later.", 500));
  }
});

// forget password

// reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1. Get user based on token

  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  console.log(hashToken, user, 'USER IN AUTH MODULE Reset password');

  //2. if token is not expired then set new password
  if (!user) {
    return next(new appError('Token is invalid or expired', 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  //3. update changePasswordAt property for user
  await user.save();

  //4.  Log the user in ,send the JWT token

  createSendToken(user, 201, res);
});
// reset password

// update current password
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1 Get user from collection

  const user = await User.findById(req.user.id).select('+password');

  //2. Check if posted current password is correct

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new appError('Your current password is wrong ', 401));
  }

  //3. if So, update current password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  createSendToken(user, 200, res);

  //4. log user and send JWT token
});
// update current password
