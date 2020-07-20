const mongoose = require('mongoose');
const slugify = require('slugify');
const validator= require('validator');
const User = require('./../models/userModel');
const Tour = require('./../models/tourModel')
// review / rating / createdAt / ref to user / ref to user


const reviewSchema = new mongoose.Schema( {
   rating : {
            type: Number,
            required: true,
            min: [1, 'It must be greater or equal 1'],
            max: [5, 'It must be lesser or equal 5'],
      
            },
    review: {
        type: String, 
        required: [true, 'A review can´t be empty!'],
        minlength: [3, 'A review must have more or equal 3 characters'],

    },
    createdAt: {
        type: Date, 
        default: Date.now
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', 
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour'
    },
    
       
}, 

{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  
  } 
  );
  
reviewSchema.index({ tour: 1, author: 1 }, {unique: true});

reviewSchema.pre(/^find/, function(next)  {
    // this.populate({
    //     path: 'tour ',
    //     select:'name price',


    // });
    this.populate({
        path: 'author ',
        select:'-__v -passwordChangedAt -email',

    });

    next();
});

reviewSchema.statics.calcAvgRat = async function(tourId) {
    const stats = await this.aggregate([
      {
        $match: {tour: tourId}
      },
      {
        $group: {
          _id: '$tour',
          nRating: { $sum: 1},
          avgRating: {$avg: '$rating'}
        }
      }
    ]);

     if (stats.length > 0) { 
      await Tour.findByIdAndUpdate(tourId, {
        ratingsAverage: stats[0].avgRating,
        ratingsQuantity:stats[0].nRating
       });
  
     } else {
      await Tour.findByIdAndUpdate(tourId, {
        ratingsAverage: 4.5,
        ratingsQuantity: 0
       });
  
     }

  };

reviewSchema.post('save', function() {
    this.constructor.calcAvgRat(this.tour);
});



  
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    next();
})

reviewSchema.post(/^findOneAnd/, async function() {
    //this.r = await this.findOne(); Does not work here because query have already executed
    
    await this.r.constructor.calcAvgRat(this.r.tour);

})


const Review = mongoose.model('Review', reviewSchema) // Good Practice: To put the model Uppercase

module.exports = Review;


// POST - /tour/23423/reviews
// GET - /tour/23423/reviews
// GET - /tour/232323/reviews/23323
