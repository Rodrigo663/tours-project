const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');
const appError = require('./../utils/appError');
const Email = require('./../utils/email');
const Tour = require('./../models/tourModel');
const Booking = require('../models/bookingModel');
const factory = require('./../controllers/handlerFactory');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
exports.getBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.addBooking = factory.addOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);


exports.getCheckoutSession = catchAsync(async(req, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.id);
    // 2) - Create checkout section
    const session = await stripe.checkout.sessions.create({


        ////////////////////////////////////
        ///// INFORMATION ABOUT THE SESSION ITSELF
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.id}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        // This will be important in order to create a new booking in our database
        // So we can specify some custom value here
        client_reference_id: req.params.tourId,
        // Details about the product
        ////////////////////////////////////
        
        ///// INFORMATION ABOUT THE PRODUCT THE USER IS ABOUT TO PURCHASE
        line_items: [    
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                // They need to be lived images, because Stripe will upload these images
                // Only when our website is finally deployeded we can start thinking on it
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                // Must be in cents!!
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1

            }
        

        
        ]

    });

    // 3) - Create session as a response

    res.status(200).json({
        status: 'success',
        session
    });
});

exports.createBookingCheckout = catchAsync( async (req, res, next) => {
    // This is only TEMPORARY, becasue it´s UNSECURE: everyone can acess it!!!!!
    const { tour, user , price }= req.query;
    if(!tour && !user && !price ) return next();
    await Booking.create({
        tour,
        user,
        price
    });

    res.redirect(req.originalUrl.split('?')[0]);

});
