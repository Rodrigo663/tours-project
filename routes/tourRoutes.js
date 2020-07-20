const express = require('express');
const tourController = require(`${__dirname}/../controllers/tourController`);
const fs = require('fs');
const userAuth = require(`${__dirname}/../controllers/authController`);
const reviewController = require(`${__dirname}/../controllers/reviewController`);
const reviewRouter= require('./../routes/reviewRoutes');




// MIDDLEWARE FUNCTION

const router  =express.Router();

// router.route('/:tourID/reviews').post(userAuth.protect, userAuth.protectReview, reviewController.addReview)


// POST - /tour/23423/reviews
// GET - /tour/23423/reviews
// GET - /tour/232323/reviews/23323


router.use('/:tourID/reviews', reviewRouter);

//router.param('id', tourController.checkID);





router.route('/tour-stats/:field').get(tourController.getTourStats);

router.route('/monthly-plan/:year')
        .get(userAuth.protect, userAuth.restrictTo('lead-guide', 'admin'), tourController.getMonthlyPlan);


router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.geTours);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getDistances);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)


// USE THE FUNCTION IN DIFFERENT SITUATIONS
router.route('/')
    .get(tourController.geTours)
    .post(userAuth.protect, userAuth.restrictTo('lead-guide', 'admin'), tourController.addTour);
router.route('/:id')
.get(tourController.geTour)
.patch(userAuth.protect, 
    userAuth.restrictTo('lead-guide', 'admin'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour)
.delete(userAuth.protect, userAuth.restrictTo('admin', 'lead-guide'),  tourController.deleteTour);


// 
//EXPORT THE FUNCTION
module.exports = router;