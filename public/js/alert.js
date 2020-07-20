// type is 'success' or 'failure'
import $ from 'jquery';

export const hideAlert = () => {
    var el = $('.alert');
    if (el) {
        el.remove();

        
    }
}
export const showAlert = (type, msg) => {
    hideAlert();

    const markup= `<div class='alert alert--${type}'>${msg}</div>`;
    $('body').append(markup);
    window.setTimeout(hideAlert, 5000);
   
}