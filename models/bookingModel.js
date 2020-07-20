const mongoose = require('mongoose');
const slugify = require('slugify');
const validator= require('validator');
const User = require('./../models/userModel');
const bookingSchema = new mongoose.Schema( {
    tour: { 
        type:mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'A booking must have a tour!']
    },
    user: { 
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A booking must have a user!']
    },
    price: {
        type: Number,
        required: [true, 'A booking must have a price!']
    },
    paid: {
        type: Boolean,
        default: true
    }
});

bookingSchema.pre(/^find/, function(next) {
  
    this.populate('user').populate({
      path: 'tour',
      select: 'name'
    });
    next();
  });
// bookingSchema.virtual('tour', {
//     ref: 'Tour', 
    
//     // Specify the name of the fields in order to connect the two data sets.
    
//     // Foreign ID
//     foreignField: 'id',
    
//     // Local ID
//     localField: 'tour'
//     });
      
const Booking= mongoose.model('Booking', bookingSchema);
 // Good Practice: To put the model Uppercase

module.exports = Booking;
