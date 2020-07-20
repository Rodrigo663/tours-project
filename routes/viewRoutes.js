const express = require('express');
const viewController = require(`${__dirname}/../controllers/viewController`);
const userAuth = require(`${__dirname}/../controllers/authController`);
const bookController = require(`${__dirname}/../controllers/bookingController`);

const router= express.Router();

// PASS THE PARAMETERS TO THE FUNCTION


router.get('/',bookController.createBookingCheckout, userAuth.isLoggedIn,  viewController.getOverview);
  
router.get('/tour/:slug',userAuth.isLoggedIn, userAuth.hasBookedIt, viewController.getTour);

router.get('/auth/login',userAuth.isLoggedIn, viewController.getLogin);
router.get('/auth/signup',userAuth.isLoggedIn, viewController.getSign);

router.get('/me', userAuth.protect, viewController.getAccount);
router.get('/my-reviews', userAuth.protect, viewController.getMyReviews);

router.post('/submit-user-data',userAuth.protect, viewController.updateUserData);
router.get('/publish/:slug', userAuth.protect, viewController.getReviewPublishment)
router.get('/edit/:slug', userAuth.protect, viewController.getReviewEdit)

router.get('/my-tours',userAuth.protect, viewController.getMyTours);

  

module.exports = router;

