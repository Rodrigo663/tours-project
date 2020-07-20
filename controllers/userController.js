const fs = require('fs');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError');
const factory = require('./../controllers/handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
/////////////////////////////////////////////////
////////// MIDDLEWARES


// DISK ENGINE
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users')
//   },
//   filename: (req,file, cb) => {
//     // user-765454-34343434.jpg
//     const exte = file.mimetype.split('/')[1];
//     const uniqueSuffix =  req.user.id + '-' +  Date.now() 
//     cb(null,  `user-${uniqueSuffix}.${exte}`);
//   }
// });


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
})


exports.uploadUserPhoto = upload.single('photo'),


exports.resizeImage =catchAsync(async(req, res, next) => {
  if (!req.file) {
    return next();
  };
  const uniqueSuffix =  req.user.id + '-' +  Date.now() 
  req.file.filename = `user-${uniqueSuffix}.jpeg`;



  await sharp(req.file.buffer)
  .resize(500, 500)
  .toFormat('jpeg')
  .jpeg({quality: 90})
  .toFile(`public/img/users/${req.file.filename}`);



  next();
});
exports.getMe = (req,res, next) => {
  
    req.params.id = req.user.id;
    next();
    
}

//////////////////////////////////////////
////// USEFUL FUNCTIONS

const filterObj = (obj, ...allowedFields) => {
    Object.keys(obj).forEach(el =>  {
        if (!allowedFields.includes(el)) {
          delete obj[el]
        };
    });
    return obj;
}
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
  );
  
//////////////////////////////////////////
////// AUTHENTICATION FUNCTIONS


exports.updateMe = catchAsync(async (req,res,next) => {

  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new appError('You can´t update your password here! Please use the /passwordUpdate route! Okay?', 400));
  }
  // 2) Update user document 
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) CHECK IF THERE IS A FILE IN THE REQUEST
  if(req.file) filteredBody.photo = req.file.filename
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, 
    runValidators: true});




  res.status(200).json({
    status: 'success',
    data: {
      updatedUser

    }
  })
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({
      status: 'success',
      data: null
    })
})


  
exports.addUser = (req, res) => {
    res.status(500).json({// Internal Server Error
      status: 'Error',
      message: 'This route is not defined! Please use /signup to add a user!'
    });
  
  }





  
//////////////////////////////////////////
////// ROUTE HANDLERS

  // Do not update passwords with this!!!

exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
  