const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
// name, photo, email, password, passwordConfirm

const userSchema = new mongoose.Schema({
  passwordChangedAt: Date,
   
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [45, 'A name must have less or equal 45 characters'],
    minlength: [2, 'A name must have more or equal 2 characters'],
  },
  role: {
      type: String,
      
      enum: ['user', 'lead-guide','guide', 'admin'],
      default: 'user'
  },
  email: {
    validate: [validator.isEmail, 'Invalid Email! Please enter a valid email!'],
    type: String,
    unique: [true, 'There is already a user using this email!'],
    required: true,
    trim: true,
    lowercase: true,
    maxlength: [56, 'An email must have less or equal 56 characters'],
    minlength: [11, 'An email must have more or equal 12 characters'],
  },
  photo: {
    type: String, 
    default: 'default.jpg'},
  
  password: {
    type: String,
    required: [true, 'You must have a password!'],
    trim: true,
    maxlength: [30, 'The password must have less or equal 30 characters'],
    minlength: [8, 'The password must have more or equal 7 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    trim: true,
    // This only works on SAVE or CREATE!!
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Your password confirmation is wrong!',
    },
  },
  passwordResetToken: String,
  passwordRestExpires: Date,
  active: {
    type: Boolean,
    select: false,
    default: true
  }
});

userSchema.pre(/^find/, function(next) {
    // THIS POINTS TO THE CURRENT QUERY
    this.find({active: {$ne: false}});
    next();
}) 

userSchema.pre('save', async function (next) {
  // Only run this functionif password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});



userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.createResetPasswordToken = async function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordRestExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;

};
userSchema.methods.changedPassword = async function (time) {

  if (this.passwordChangedAt) {
    const passwordChangedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return time < passwordChangedAt;
  }



  return false;
};
const User = mongoose.model('User', userSchema); // Good Practice: To put the model Uppercase

module.exports = User;
