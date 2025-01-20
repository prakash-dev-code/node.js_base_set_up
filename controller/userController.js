const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const User = require('./../models/userModel');
const appError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const Factory = require('./handlerFactory');

const s3Client = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const filterObj = (obj, ...allowFields) => {
  const newObj = {};

  Object.keys(obj).forEach((item) => {
    if (allowFields.includes(item)) newObj[item] = obj[item];
  });

  return newObj;
};

exports.getAllUsers = Factory.getAll(User);

const multerStorage = multerS3({
  s3: s3Client,
  bucket: 'test-cloudfront-eu-north-1',
  // acl: 'public-read',
  key: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `users/user-${req.user.id}-${Date.now()}-profile_img.${ext}`);
  },
});

// const multerStorage = multer.diskStorage({
//   destination: './public/img/users',
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new appError('Please upload an image file', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.UserPhotoUpload = upload.single('photo'); //use fields for uploading multiple images like fields([{ name: 'images',maxCount:3}])

exports.updateCurrentUser = catchAsync(async (req, res, next) => {
  //1. create error if user enter password
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new appError(
        ' This route is not for updating password , Please use /updatePassword ',
        400
      )
    );
  }

  //2. update user document

  //3. allow fields to modify

  const filterBody = filterObj(req.body, 'name', 'email');

  if (req.file) filterBody.photo = req.file.location;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  // console.log(req.file);
  // console.log(req.body);

  res.status(200).json({
    status: 'success',
    message: 'Current User data updated successfully',
    data: {
      user: updatedUser,
    },
  });
});
exports.createUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    message: 'This route is not defined yet ',
  });
};

exports.getCurrentUser = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

exports.deleteCurrentUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: 'success',
    message: 'Current User deleted successfully',
  });
});

exports.updateUser = Factory.updateOne(User);
exports.deleteUser = Factory.deleteOne(User);
exports.getUser = Factory.getOne(User);
