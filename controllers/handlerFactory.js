const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');


exports.deleteOne = Model=> catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new appError(`No document found with that ID`, 404));
    }
  
    // Get the tour of the specific ID
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = Model => catchAsync( async(req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // New updated document is the one that will be returned
        runValidators: true
      });
      if (!document) {
        return next(new appError('No document found with that ID', 404));
      }
    
      res.status(200).json({
        status: 'success',
        data: {
          document,
        },
      });
});



exports.addOne = Model =>  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        tour: document,
      },
    });
  });
  
  
exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {

    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    
    if (!doc) {

        return next(new appError('No document found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
        doc,
        },
    });
});
  
exports.getAll = Model => catchAsync(async (req, res, next) => {
  
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourID) filter ={tour: req.params.tourID}


    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .field()
      .paginate();
   
    //const tours = await features.query; // const tours = await Tour.find(query)
    const document = await features.query;
    
    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: document.length,
  
  
      data: {
        document,
      },
    });
  });
  
  