const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find().sort('price');
    // 2) Build template
    // 3) Render that template using tour data from 1)
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    })
});
exports.getMyTours = catchAsync(async(req, res, next) => {
    // 1) - Find all bookings


    const bookings = await Booking.find({user: req.user.id}).sort('tour.name');

    // 2) - Find tours with the returned Ids

    const toursIds = bookings.map(el => {
        return el.tour;
    });
    const tours = await Tour.find({_id: {$in: toursIds}}).sort('name');

    res.status(200).render('overview', {
        title: 'My Tours',
        tours,
        bookingIds: bookings
        
    })


}  ); 
exports.getSign = (req, res) => {
    res.status(200).render('signup', {
        title: 'Sign Up'

    });

};


exports.updateUserData = catchAsync( async(req,res,next) => {

    // NAME AND EMAIL MUST BE EXPLICITY UPDATED
    // BECAUSE SOME HACKER COULD EASLY MODIFY THE HTML AND ADD SOME FIELDS THAT WE DON´T WANT
    const user = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        runValidators: true,

        // WE WANT TO GET THE NEWLY UPDATED DOCUMENT AS A RESULT
        new: true
    });
    res.status(200).render('account', {
        title: 'Your account',
    


        // SO NOW WE ALSO NEED TO MODIFY THE USER VARIABLE
        // BECAUSE WILL JUST RENDER THE PAGE
        //  SO WE WAN´T PASS THROUGH THE PROTECT MIDDLEWARE
        user: user
    })

});

exports.getMyReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find({'author': req.user.id});
    res.status(200).render('reviewRow', {
        title: 'My Reviews',
        reviews
    })
})
exports.getReviewEdit = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({'slug': req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating author'
    });
    if(!tour) return next(new appError(404, 'No Tour found! Sorry!'));

    const review = await Review.findOne({'author': req.user.id, 'tour':tour.id});
    if(!review) return next(new appError(404, 'No review found! Sorry!'));
    
    res.status(200).render('edit', {
        title: 'Edit Review',
        user: req.user,
        review,
        tour

    })

})
exports.getReviewPublishment = catchAsync(async (req, res, next) => {
        const tour = await Tour.findOne({'slug': req.params.slug}).populate({
            path: 'reviews',
            fields: 'review rating author'
        });


        if (!tour) {
            return next(new appError('No tour found with that name!', 404));
        };


        res.status(200).render('publishment', {
            title: 'Publish Your Review',
            user: req.user,
            tour

        })
})

exports.getTour = catchAsync(async(req, res,next) => {
    // 1) Get the data for the requested tour (including reviews and tour-guides)
    const tour = await Tour.findOne({'slug': req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating author'
    });


    if (!tour) {
        return next(new appError('No tour found with that name!', 404));
    }
    //3) Render the template


    res.status(200).render('tour', {
        title: tour.name,
        tour
 
      });


});



// GET LOGIN TEMPLATES



exports.getLogin =( req, res) => {
    // 1) Render the lgon section of the
    res.status(200).render('login', {
        title: 'Log In into your account'
    });
};


// GET THE ACCOUNT

exports.getAccount = (req, res) => {
    // 1) Render the lgon section of the
    res.status(200).render('account', {
        title: 'Your account',
        
    });

}