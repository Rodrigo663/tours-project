const express = require('express');
const reviewController = require(`${__dirname}/../controllers/reviewController`);
const fs = require('fs');
const { patch } = require('./tourRoutes');
const userAuth = require(`${__dirname}/../controllers/authController`);


const Router= express.Router({ mergeParams: true });

Router.use(userAuth.protect);


Router.route('/').get(reviewController.getReviews).post(userAuth.protect, userAuth.protectReview,reviewController.addTourAndUser, reviewController.addReview);

Router.route('/:id').get(reviewController.getReview).patch(userAuth.restrictTo('user', 'admin'),userAuth.protect, userAuth.protectReview, reviewController.updateReview).delete(userAuth.protect, userAuth.restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = Router;





