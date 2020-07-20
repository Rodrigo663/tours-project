const express = require('express');
const userController = require(`${__dirname}/../controllers/userController`);
const userAuth = require(`${__dirname}/../controllers/authController`);
const reviewController = require(`${__dirname}/../controllers/reviewController`);

const fs = require('fs');
const { route } = require('./tourRoutes');
const { Router } = require('express');





// MIDDLEWARE FUNCTION
const router  =express.Router();
router
    .post('/signup', userAuth.signup);
router
    .post('/login', userAuth.login);
router.get('/logOut', userAuth.logout);

router
    .post('/forgotPassword', userAuth.forgotPassword);
router
    .patch('/resetPassword/:token', userAuth.resetPassword);


router.use(userAuth.protect);
router
    .patch('/updatePassword', userAuth.updatePassword);
    

router
    .patch('/updateMe', userController.uploadUserPhoto, userController.resizeImage, userController.updateMe);

router
    .patch('/deleteMe', userController.deleteMe);

router
    .get('/me', 
    userController.getMe, 
    userController.getUser);

router.use(userAuth.restrictTo('admin'));

router
    .route('/').get(userController.getUsers).post(userController.addUser);
router
    .route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);





module.exports = router;
  


