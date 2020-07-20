const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');
const appError = require('./../utils/appError');
const Email = require('./../utils/email');
const Tour = require('./../models/tourModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const crypto = require('crypto');
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),


    // The cookie will be encrypted, sent by https request.

    // The cookie cannot be accessed or modiefied by the browser
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove the password from the output

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.hasBookedIt = catchAsync(async (req, res, next) => {

  if (!req.user) {
    next();
  }
  // Get the tour ID
  const tour = await Tour.findOne({'slug': req.params.slug});

  // Check if the user id is in one of the returned books
  const bookings = await Booking.find({ 'tour': tour.id, 'user':req.user.id });
  if (bookings.length < 1 ) return next();

  // Get all reviews 
  const reviews = await Review.findOne({'author': req.user.id, 'tour':tour.id });

  if (reviews) {


    res.locals.published = true;
  }
  res.locals.isBooked = true;



  next();
});
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array
    if (!roles.includes(req.user.role)) {
      return next(
        new appError(
          'OPPS! You don´t have permission to access this part of the page!!',
          403
        )
      );
    }

    next();
  };
};

exports.protectReview = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.role !== 'user') {
    return next(
      new appError('Only normal users are authorized to write a review!', 401)
    );
  }
  next();
});

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
  
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exist

  if (!email || !password) {
    return next(
      new appError('Please provide a valid email and password!', 400)
    );
  }

  // 2) Check if the user exists && the password is correct
  const user = await User.findOne({ email }).select('+password');

  // 3) If everything ok, send token to client
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new appError('Either the password or the email may be wrong', 401)
    );
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting the token and check if it´s there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new appError('You are not logged in!! Please log in to get acess!!', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) Check if user still exists

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    next(new appError('The user no longer exist! Sorry!', 401));
  }
  // 4) Check if user changed password after the token was issued
  if (await currentUser.changedPassword(decoded.iat)) {
    return next(
      new appError(
        'Opps! I think some security informations have changed! Try to log in again!',
        401

        
      )
    );
  }

  // GRAN ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

exports.isLoggedIn = async(req, res, next) => {
  if (req.cookies.jwt) {

    try {
          // 1)  Verify the token
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
    // 2) Check if user still exists

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      next();
    }
    // 4) Check if user changed password after the token was issued
    if (await currentUser.changedPassword(decoded.iat)) {
        next();
      }

    // THERE IS A LOGGED USER
    res.locals.user = currentUser;
    req.user = currentUser;

    } catch(err) {
      return next();
    }
  } 
  
  next();


};
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 *1000),
    httpOnly: true
  });
  res.status(200).json({
    status: 'success'
  })
}
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POST email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new appError('Didn´t find any user with this email!', 400));
  }
  // 2) Generate the random token

  const resetToken = await user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  // 3) Send it to the user´s email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
  

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: `Token sent to email!`,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordRestExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new appError(
        'There was an error sending the email. Try again later!!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get User Based on the Token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordRestExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is a user set the new password
  if (!user) {
    return next(
      new appError(
        'Ops! Your token is invalid or may have already expired! Do a new request!',
        400
      )
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordRestExpires = undefined;
  await user.save();

  // 3) Update password changedAt property for the user

  // 4) Log the user in, send JWT
  createSendToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get the user from the collection

  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if the posted password is correct

  if (
    !user ||
    !(await user.correctPassword(req.body.currentPassword, user.password))
  ) {
    return next(new appError('Your password may be wrong! Type again', 401));
  }

  // 3) If so, update the password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.confirmPassword;

  await user.save();

  // User.findByIdandUpdate will now work as intended!

  // 4) Log the use in, with the new token
  createSendToken(user, 200, res);

});
