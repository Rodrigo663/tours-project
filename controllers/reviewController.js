// MODULES

const Review = require('./../models/reviewModel');
const factory = require('./../controllers/handlerFactory');


/////////////////////////////////////
//////// MIDDLEWARES

exports.addTourAndUser = (req,res,next) => {
    if (!req.body.tour) req.body.tour = req.params.tourID;
    if (!req.body.user) req.body.author =req.user.id;
    next();

}


/////////////////////////////////////
//////// Route Handlers

exports.getReviews = factory.getAll(Review);
exports.getReview = factory.addOne(Review);
exports.addReview = factory.addOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

