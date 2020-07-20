// Update data
import axios from 'axios';
import { showAlert, hideAlert } from './alert.js'


export const updateSettings = async(data, type) => {
    try {
        const url = type === 'Data' ? 'http://127.0.0.1:3000/api/v1/users/updateMe' : 'http://127.0.0.1:3000/api/v1/users/updatePassword'
        const res = await axios({
            method: 'PATCH',
            url,
            data 
               
        
        });
        if(res.status === 200) {

            showAlert('success', `${type} Succesfully Updated!`);
            

            //WE NEED TO SPECIFY TRUE, AND THEN WILL FORCE TO RELOAD FROM THE SERVER AND NOT FROM BROWSER CACHE
            window.setTimeout(()=> {
                location.reload(true);
            }, 2000);

        };


    
    } catch(err) {
        showAlert('error', err.response.data.message);

    }
    
}