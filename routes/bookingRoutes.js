const express = require('express');
const userController = require(`${__dirname}/../controllers/userController`);
const userAuth = require(`${__dirname}/../controllers/authController`);
const bookController = require(`${__dirname}/../controllers/bookingController`);
const fs = require('fs');
const { route } = require('./tourRoutes');
const { Router } = require('express');



// MIDDLEWARE FUNCTION
const router  =express.Router();

router.get('/checkout-session/:id',userAuth.protect, bookController.getCheckoutSession);
router.use(userAuth.protect);
router.delete('/:id',  bookController.deleteBooking);

router.use(userAuth.restrictTo('admin', 'lead-guide'));


router.route('/').get(bookController.getBookings).post(bookController.addBooking);

router.route('/:id').get(bookController.getBooking).patch(bookController.updateBooking);


module.exports = router;
  


