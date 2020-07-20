const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
module.exports= class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        
        this.from = `Rodrigo Schroeder <${process.env.EMAIL_FROM}>`

    } 
    newTransport() {
        if(process.env.NODE_ENV === 'development') {
            return nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
        } 
            return nodemailer.createTransport({
                service: "SendGrid",
                auth: {
                    user: process.env.GRID_NAME,
                    pass: process.env.GRID_PASSWORD


                }
            })
        
    } 

    async send(template, subject) {
        // 1) Render the HTML email based on a pug template

        // Create a pug template with the local variables 
        // We won´t render it yet

        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });
        let target = this.from;
        if (process.env.NODE_ENV === 'production') {
            target= process.env.EMAIL_FROM
        }


        // 2) Define the email options
        const mailOptions = {
                from:target,
                to: this.to,
                subject: subject,
                // Converting our HTML to text
                text: htmlToText.fromString(html),
                html
        
            };

        //3)  Create a transporter and send Email

        
        await this.newTransport().sendMail(mailOptions);

    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset() {
        await this.send('resetPassword', 'Your password reset token (valid for only 10 minutes!!)');
    }

}

