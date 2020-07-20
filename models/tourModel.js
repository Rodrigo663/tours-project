const mongoose = require('mongoose');
const slugify = require('slugify');
const validator= require('validator');
const User = require('./../models/userModel');

const tourSchema = new mongoose.Schema( {
    name: {
      type: String,
      required: [true, 'A tour must have a name!'],
      unique: [true, 'DRY!'],
      trim: true, // Remove all the white space in the beginning and end of the string
      maxlength: [40, 'A name must have less or equal 40 characters'],
      minlength: [10, 'A name must have more or equal 10 characters'],
      //validatee: [validator.isAlpha, "It must only contains letters from A-Z!"]



    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration!']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size!']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium and difficult.'
      }

    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'It must be greater or equal 1'],
      max: [5, 'It must be lesser or equal 5'],
      set: val => Math.round(val * 10) / 10 // 4.66666667 46.6666 47 4.7
 

    },

    ratingsQuantity: {
      type: Number,
      default:0
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) { 
        // this only points to current DOC on NEW document creation
        return val < this.price;
      },

        message: "Hey There! You made an error! ({VALUE} is bigger that the regular price!)"
      } 
      
    },
    summary: {
      type: String,
      trim: true, // Remove all the white space in the beginning and end of the string
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
        type: String,
        required:[true, 'A tour must have a cover image!']

    },
    images : [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],

    price: {
    type: Number,
    required: [true, 'A tour must have a price!'],

  },
  secretTour: {
    type: Boolean,
    default: false
  },
  startLocation: {
    // GeoJSONs
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    // LONGITUDE, LATITUDE
    coordinates: [Number],
    address: String,
    description: String

  },
  locations: [
    {
      type:{
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      adress: String,
      description: String,
      // Day of the tour in which people will go to this location
      day: Number
    }
  ],
  guides: [
    {

      // The NEW Data Type you must remember!
      type: mongoose.Schema.ObjectId,

      // Reference between different data sets in Mongoose
      ref: 'User'
      
    }
  ]





  

},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }

} )

// Virtual Populate
tourSchema.index({'startLocation': '2dsphere'});

  

tourSchema.virtual('reviews', {
  ref: 'Review', 

  // Specify the name of the fields in order to connect the two data sets.
  
  // Foreign ID
  foreignField: 'tour',

  // Local ID
  localField: '_id'
});

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});


tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({slug: 1});





// DOCUMENT MIDDLEWARE: runs before the .save() and .create(), but not for .insertMany()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {lower: true});
  next();
});


// tourSchema.pre('save', async function(next) {
//   const guides = this.guides.map(async el => {
//     return await User.findById(el);

//   });
//   this.guides = await Promise.all(guides);


//   next();
// })

// tourSchema.pre('save', function(next) {
//   console.log('Will save the document...');
//   next();
// });



// tourSchema.post('save', function(doc, next) {
//     console.log(`The finished document: ${doc}`);
//     next();
// });



// QUERY MIDDLEWARE

tourSchema.pre(/^find/, function(next) {

    this.find( {secretTour: {$ne: true}} );
    this.date = Date.now();
    next();
});
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select:'-__v -passwordChangedAt',

  });
 
  next();
})
tourSchema.post(/^find/, function(docs, next)  {


  //console.log(docs);

  next();
});

// Aggregation Middleware

tourSchema.pre('aggregate', function(next) {
  // Adding element at the beginning of an array, shift to add in the end
  this.pipeline().push({ $match: { secretTour: { $ne: true } } });

  next();
});




const Tour = mongoose.model('Tour', tourSchema) // Good Practice: To put the model Uppercase

module.exports = Tour;





