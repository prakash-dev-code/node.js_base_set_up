const express = require('express');
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');

const userRouter = express.Router();

userRouter.get(
  '/me',
  authController.protect,

  userController.getCurrentUser,
  userController.getUser
);

userRouter.post('/signup', authController.signup);
userRouter.post('/signin', authController.signin);
userRouter.post('/forgetPassword', authController.forgetPassword);
userRouter.patch('/resetPassword/:token', authController.resetPassword);
userRouter.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);
userRouter.patch(
  '/updateCurrentUser',
  authController.protect,
  userController.UserPhotoUpload,
  userController.updateCurrentUser
);

userRouter.patch(
  '/deleteCurrentUser',
  authController.protect,
  userController.deleteCurrentUser
);

userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
