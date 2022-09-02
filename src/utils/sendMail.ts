const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,

    auth: {
        user: process.env.nodeMailerEmail,
        pass: process.env.nodeMailerPassword
    },
    tls: { 
        rejectUnauthorized: false 
    }
});

type MailOptions = {
    to: string,
    subject: string,
    html: string,

}
const sendMail = (mailOptions: MailOptions) => {
    const defaultMailOptions = {
        from: process.env.nodeMailerFrom,
      };
    
    const finalMailOptions = {
        ...defaultMailOptions,
        ...mailOptions
    }
    transporter.sendMail(finalMailOptions, function (error: any, info: any) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = sendMail;