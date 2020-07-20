import { login, logout } from './login.js';
import '@babel/polyfill';
import { displayMap } from './mapbox.js';
import { bookTour } from './stripe.js';
import { signup } from './signup.js';
import { submit, update, deleteReview, deleteBooking } from './submit.js';
import { updateSettings } from './updateSettings.js';
import $ from 'jquery';

// FUNCTIONS_IN

function loop() {
  let number = 0;
  for (let i = 1; i < 6; i++) {
    let color = $(`#star-${i}`).is(':checked');
    if (color) {
      number = i;
    }
  }
  //if(number === 0) number =1;
  return number;
}
// MARKUPS

// DOM elements
const reviewArea = $('.review-area');
const formSign = $('.form--signup');
const mapBox = $('#map');
const form = $('.form--login');
const formUserData = $('.form-user-data');
const logoutEle = $('.nav__el--logout');
const submitButton = $('#myButton');
const formPassword = $('.form-user-settings');
const buttonSave = $('#myButtontwo');
const cancelBooking = $('.cancelBooking');
const greenButton = $('#book-tour');
const errorButton = $('#errorButton2');


const slug = window.location.href.split('/')[window.location.href.split('/').length - 1];

//DELEGATION
if(cancelBooking.length) {
  cancelBooking.on('click', e => {
    let bookingId = JSON.parse(e.target.dataset.user);

    deleteBooking(bookingId._id);

  })
}

if (buttonSave.length) {
  const review = $('#review-input');
  const rat = reviewArea.data()[Object.keys(reviewArea.data())[0]];
  $(`#star-${rat}`).prop("checked", true);
  buttonSave.on('click', (e) => {
    const reviewText = review.val();
    const num = loop();
    const ide = errorButton.data();

    const obj = { rating: num, review: reviewText };
    update(ide, obj, slug);
  });
}

if (errorButton.length) {

  errorButton.on('click', e => {
    deleteReview(e.target.dataset, slug);
  });
}
if (submitButton.length) {
  submitButton.on('click', (e) => {
    // 1) Get the review
    const review = $('#review-input').val();
    // 2) Get the ratingA
    const num = loop();
    // 3) Get the author
    const { userId } = e.target.dataset;
    // 4) Get the current tour
    const { tourId } = $('#review-input').data();

    const obj = {
      rating: num,
      review,
      author: userId,
      tour: tourId,
    };
    submit(obj, slug);
  });
}
if (greenButton.length) {
  greenButton.on('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
if (formSign.length) {
  formSign.on('submit', async (e) => {
    e.preventDefault();
    const obj = {
      name: $('#name').val(),

      email: $('#email').val(),
      password: $('#password').val(),
      passwordConfirm: $('#password-confirm').val(),
    };

    $('.btn-sign').text('Signing Up...');

    await signup(obj);
    $('.btn-sign').text('Sign Up');
  });
}

if (formPassword.length) {
  formPassword.on('submit', async (e) => {
    $('.btn--save-password').text('Updating...');
    e.preventDefault();
    let currentPassword = $('#password-current').val();
    let newPassword = $('#password').val();
    let confirmPassword = $('#password-confirm').val();

    await updateSettings(
      { currentPassword, newPassword, confirmPassword },
      'Password'
    );
    $('.btn--save-password').text('Save Passsword');

    $('#password-confirm').val('');
    $('#password-current').val('');
    $('#password').val('');
  });
}

if (formUserData.length) {
  formUserData.on('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', $('#name').val());
    form.append('email', $('#email').val());

    form.append('photo', $('#photo')[0].files[0]);


    updateSettings(form, 'Data');
  });
}

if (mapBox.length) {
  const locations = JSON.parse(mapBox.attr('data-locations'));

  displayMap(locations);
}

if (form.length) {

  form.on('submit', (e) => {
    e.preventDefault();
    const email = $('#email').val();

    const password = $('#password').val();
    login(email, password);
  });
}

if (logoutEle.length) {
  logoutEle.on('click', logout);
}
