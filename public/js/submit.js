import axios from 'axios';
import { showAlert } from './alert.js'

function returnId(id) {
    let r;
    Object.keys(id).forEach(el => {
        r = id[el]
    });
    return r;
}

export const submit = async(data, slug) => {
    try {
        const res = await axios({
            method:'POST',
            url: 'http://127.0.0.1:3000/api/v1/reviews',
            // DATA OF THE BODY

            data
           
        });
        if (res.status === 201) {
            showAlert('success', 'Succesfully Published!')

            window.setTimeout(()=> {
                location.assign(`/tour/${slug}`);
            },2000)
        }

    } catch(err) {
        showAlert('error', err.response.data.message);

    }
}
export const update = async(id, data, slug) => {
    try {
       
        let r = returnId(id);
        const url = `http://127.0.0.1:3000/api/v1/reviews/${r}`;
        const res = await axios({
            method:'PATCH',
            url,
            // DATA OF THE BODY
            data
           
        });
        if (res.status === 200) {
            showAlert('success', 'Succesfully Edited!')

            window.setTimeout(()=> {
                location.assign(`/tour/${slug}`);
            },2000)
        }

    } catch(err) {
        showAlert('error', err.response.data.message);

    }
}

export const deleteReview = async(id, slug) => {
    try {
        let r = returnId(id);

        const url = `http://127.0.0.1:3000/api/v1/reviews/${r}`;
        const res = await axios({
            method:'DELETE',
            url
            // DATA OF THE BODY
        });
        if (res.status === 204) {
            showAlert('success', 'Succesfully Deleted!')

            window.setTimeout(()=> {
                location.assign(`/tour/${slug}`);
            },2000)
        }

    } catch(err) {
        showAlert('error', err.response.data.message);

    }
}


export const deleteBooking= async(id) => {
    try {

        // To get booking
        const url = `http://127.0.0.1:3000/api/v1/bookings/${id}`;
        const res = await axios({
             method:'DELETE',
             url
         });
        if (res.status === 204) {
            showAlert('success', 'You canceled the booking! You money will be refund soon! ')
            window.setTimeout(()=> {
                location.assign(`/`);
            },3000);

    }



    } catch(err) {
        showAlert('error', err.response.data.message);

    }
}



