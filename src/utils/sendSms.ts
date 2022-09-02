require('dotenv').config();

// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const sendSms = (to:string | number, smsText: string) => {
    client.messages
        .create({
            body: smsText,
            from: '+18775614334',
            to: '+91' + to
        })
        .then((message: any) => console.log(message.sid))
        .catch((err: any) => console.log(err));
}

module.exports = sendSms;