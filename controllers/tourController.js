const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const multer = require('multer');
const sharp = require('sharp');
const factory = require('./../controllers/handlerFactory');
const APIFeatures = require('./../utils/apiFeatures');
////////////////////////////////////////////////
//////// ROUTES HANDLERS


exports.geTours = factory.getAll(Tour);
exports.geTour = factory.getOne(Tour, { path: 'reviews' });
exports.addTour = factory.addOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);


// MULTIPLE IMAGES PROCCESSING


const multerStorage = multer.memoryStorage();
// FILTER

const multerFilter = (req, file, cb) => {
    
  
    if(file.mimetype.startsWith('image')) {
   
      // NO ERROR, SO WE NEED TO PASS TRUE
      cb(null, true)
    } else {
      cb(new appError('Not an image! Please double check the selected file!', 400), false)
    }
}


const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});


exports.uploadTourImages= upload.fields([
  {name: 'imageCover', maxCount: 1},
  {name: 'images', maxCount: 3}

]);


exports.resizeTourImages  =catchAsync(async (req, res,next) => {
  if(!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    // 3/2 Ratio
  .resize(2000, 1333)
  .toFormat('jpeg')
  .jpeg({quality: 90})
  .toFile(`public/img/tours/${req.body.imageCover}`);

  // Updating the cover image name in the request body
  req.body.images = [];

  await Promise.all(req.files.images.map(async(el ,i) => {
    const name  = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
    await sharp(el.buffer)
    // 3/2 Ratios
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`public/img/tours/${name}`);
    req.body.images.push(name);


  }));

  next();
});

//upload.array('images', 5)
//exports.uploadUserPhoto = upload.single('photo'),

////////////////////////////////////////////////
//////// ADVANCED QUERIES

// Geospatial QUERY

exports.getToursWithin = catchAsync( async (req, res,next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, long] = latlng.split(',');


  if(!lat || !long) {
    return next(new appError('Please define a valid longitude and latitude!', 400));
  };
  if (unit !== 'km' && unit !== 'mi') {
    return next(new appError('Please define a valid unit! km or mi!', 400));

  }
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;



  const tours = await Tour.find({ startLocation: { $geoWithin: {$centerSphere:[[long, lat], radius] } }})
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  })


});

exports.getDistances = catchAsync(async (req, res, next)=> {
  const { distance, latlng, unit } = req.params;
  const [lat, long] = latlng.split(',');


  if(!lat || !long) {
    return next(new appError('Please define a valid longitude and latitude!', 400));
  };
  if (unit !== 'km' && unit !== 'mi') {


    


    return next(new appError('Please define a valid unit! km or mi!', 400));

  }
  const mult = unit ==='km' ? 0.001 : 0.000621371
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'point', 
          coordinates: [long*1, lat*1]
          
        },
        distanceField: 'distance',
        distanceMultiplier: mult
      }
    }, 
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  })


});


////////////////////////////////////////////////
//////// Stats



//Aggregation Pipeline: Matching and Grouping

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'names,price,ratingsAverage,summary,diffculty';
  next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
  //GETTING MEDIAN
  req.query.sort = 'price';
  req.query.fields = 'price';
  
  const field = !req.params.field ? 'difficulty' : req.params.field;
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .field()
    .paginate();

  let tours = await features.query;

  tours = Array.from(tours);
  const target = Math.floor(tours.length / 2);

  let median = tours[target].price;

  // 2 PART
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 1 } },
    },
    {
      $group: {
        _id: { $toUpper: `$${field}` },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },

        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        docObj: {
          $addToSet: '$$CURRENT'
      }
        
        
      },
    },
    {
      $sort: { avgPrice: -1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  // Adding the median price property to each one:
  const keys  = Object.keys(stats);
  let myArray = [];
  
  keys.forEach(el => {
    const r = Object.keys(stats[el].docObj);
    const target= stats[el].docObj[r[1]];
    stats[el].docObj.forEach(el2 => {
      myArray.push(el2.price);

    });
    myArray.sort(function(a, b) {
      return a - b;
    });
    const med= myArray[(Math.round(myArray.length / 2))-1];
    if (stats[el].numTours === 2) {
      stats[el].medianPrice = 'Impossible to have a median value between 2 elements!'
    } else {
      stats[el].medianPrice = med;

    }
   delete stats[el].docObj;
   myArray = [];
  });

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // Year taken from the URL
  const year = req.params.year * 1; // 2021

  // Plan Functions
  const plan = await Tour.aggregate([
    {
      $unwind: {
        path: '$startDates',
        includeArrayIndex: 'Index:',
      },
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },

        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },

    {
      $project: {
        startDates: 1,
        tours: 2,
        numTours: 3,
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $sort: { numTours: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
