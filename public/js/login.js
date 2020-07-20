// Importing axios in the JS way, not in the node JS way.
import axios from 'axios';
import { showAlert, hideAlert } from './alert.js'

export const login = async(email, password) => {
    console.log('here');
    try {
        const res = await axios({
            method:'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            // DATA OF THE BODY

            data: {
                email,
                password
            }
        });
        if (res.status === 200) {
            showAlert('success', 'Succesfully Logged in!')

            window.setTimeout(()=> {
                location.assign('/');
            },2000)
        }

    } catch(err) {
        showAlert('error', err.response.data.message);

    }
}


export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logOut',
        });
        if (res.status === 200) {
            // WE NEED TO SPECIFY TRUE, AND THEN WILL FORCE TO RELOAD FROM THE SERVER AND NOT FROM BROWSER CACHE
            window.setTimeout(()=> {
                location.assign('/');
            }, 100);
        }



    } catch {
        showAlert('error', 'Error logging out! Try again later! ')
    }
}


