import axios from 'axios';
const stripe = Stripe('pk_test_51H4rumHjcSXMUMWn543wHybUXGgQpQTXeTJPaIK8iou1gIj4az47UskfxdQNvHd4iQFXAE2Wku7V9rO77d0SwaNK003Rg7rhAO');
import { showAlert, hideAlert } from './alert.js'

export const bookTour = async tourId=> {
    // 1) GET THE SESSION 
    try {

    
    const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);


    // 2) Create checkout + charge credit card

    await stripe.redirectToCheckout({
        sessionId: session.data.session.id
    });

    } catch(err) {
        showAlert('error', err);
    }

    
};