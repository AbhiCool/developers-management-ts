// Import needed model
const Users = require('../db/models/users');

const sendMail = require('../utils/sendMail');

const sendSms = require('../utils/sendSms');

const { randomStringOfNumbers } = require('../utils/commonFunctions');

import {Request, Response} from 'express';

import { ISession } from '../types/issession';

const onSlashGet = async (req: Request, res: Response) => {

    try {
        const usersArray = await Users.query().withGraphFetched('userProfile')
        console.log(usersArray);
    }
    catch (err) {
        console.log(err);
    }
    res.redirect("login");
} // End of onSlashGet

const onLoginGet = (req: Request, res: Response) => {
    res.render("login");
} // End of onLoginGet

const onLoginPost = async (req: Request, res: Response) => {
    console.log(req.body);

    const { loginFormEmail } = req.body

    try {
        const usersArray = await Users.query()
            .select('user_id', 'email_id', 'email_otp_verified', 'phone_otp_verified', 'isAdmin')
            .where('email_id', loginFormEmail)

        console.log('usersArray', usersArray);

        // If email provided is not present in users table
        if (usersArray.length === 0) {
            return res.status(403).json({
                err: "Invalid user"
            });
        }
        // If email id is present in  users table
        if (usersArray.length === 1) {
            const { user_id, email_otp_verified, phone_otp_verified, isAdmin} = usersArray[0];
            // If either email_otp_verified or phone_otp_verified are false in table for loggin in user
            if (!email_otp_verified || !phone_otp_verified) {

                return res.status(403).json({
                    err: "Cannot login as email otp or sms otp is not verified"
                });
            }

            // Here means user is valid.
            // Set the userId in session
            (req.session as ISession).userId = user_id;
            (req.session as ISession).isAdmin = isAdmin;
            
            console.log('req.session.userId in /login', (req.session as ISession).userId);
            console.log('req.session.isAdmin in /login', (req.session as ISession).isAdmin);

            return res.json({
                err: null,
                userId: user_id,
                isAdmin: isAdmin,
                status: "Logged in successfully",
            });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
} // End of onLoginPost

const onSignUpGet = (req: Request, res: Response) => {
    res.render("signUp");
} // End of onSignUpGet

const onSignUpPost = async (req: Request, res: Response) => {
    console.log('req.body', req.body);
    // Create email otp
    const emailOtp = randomStringOfNumbers(4);

    // Create phoneOtp
    const phoneOtp = randomStringOfNumbers(4);

    const { registerFormFirstName, registerFormLastName, registerFormEmail, registerFormPhone ,registerFormIsAdmin} = req.body;

    const isAdmin = (!registerFormIsAdmin) ? false : true;

    // Check if email id provided already present in users table
    const userEmailArray = await Users.query()
                            .select('user_id')
                            .where('email_id', registerFormEmail)

    console.log('userEmailArray', userEmailArray);

    if (userEmailArray.length > 0) {
        return res.status(403).json({
            err: "Cannot use provided email id as it is already used"
        });
    }


    // Check if phone provided already present in users table
    const userPhoneArray = await Users.query()
        .select('user_id')
        .where('phone', registerFormPhone)

    console.log('userPhoneArray', userPhoneArray);

    if (userPhoneArray.length > 0) {
        return res.status(403).json({
            err: "Cannot use provided phone as it is already used"
        });
    }

    try {
        const userInsertData = await Users.query().insert({
            first_name: registerFormFirstName,
            last_name: registerFormLastName,
            email_id: registerFormEmail,
            phone: registerFormPhone,
            email_otp: emailOtp,
            phone_otp: phoneOtp,
            email_otp_verified: false,
            phone_otp_verified: false,
            isAdmin: isAdmin
        });
        console.log(userInsertData.user_id);

        res.status(201).json({
            err: null,
            status: "Signed in successfully",
            userId: userInsertData.user_id,
            isAdmin: isAdmin,
        });

        // Send the email with  emailOtp as its content
        const mailContent = `Hello ${registerFormFirstName} ${registerFormLastName},
        <p style="margin-top: 20px;">
            <span style="font-weight: bold;">${emailOtp}</span> is your OTP to verify your email id.
        </p>
        <p>${phoneOtp} is phone otp send for development purposes.</p>`;

        sendMail({
            to: registerFormEmail,
            subject: 'OTP for Developers Management',
            html: mailContent
        });

        // Send the sms with phoneOtp as its content
        const smsContent = `Hello ${registerFormFirstName} ${registerFormLastName} - ${phoneOtp} is your OTP to verify your phone number.`;

        sendSms(registerFormPhone, smsContent);
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
} // End of onSignUpPost

const onLogoutGet = (req: Request, res: Response) => {
    // Destroys the session
    req.session.destroy(() => {
        console.log("Session destroyed");
    });

    // Redirect to login page
    res.redirect("login");
} // End of onLogoutGet


const onVerifyEmailSmsOtpGet = (req: Request, res: Response) => {
    const userId = req.params.id;
    res.render("verifyEmailSmsOtp", { userId: userId });
} // End of onVerifyEmailSmsOtpGet

const onVerifyEmailSmsOtpPost = async (req: Request, res: Response) => {
    console.log('req.body', req.body);

    const { userId, verifyFormEmailOtp, verifyFormSmsOtp } = req.body;

    try {
        const usersArray = await Users.query()
            .select('user_id', 'email_id', 'phone', 'email_otp', 'phone_otp', 'email_otp_verified', 'phone_otp_verified', 'isAdmin')
            .where('user_id', userId)

        if (usersArray.length === 1) {
            console.log('usersArray[0]', usersArray[0]);

            const { phone_otp, email_otp , isAdmin} = usersArray[0];
            // If either email_otp_verified or phone_otp_verified are false in table for loggin in user
            if (email_otp != verifyFormEmailOtp) {
                return res.status(403).json({
                    err: "Wrong/invalid email Otp provided"
                });
            }
            if (phone_otp != verifyFormSmsOtp) {
                return res.status(403).json({
                    err: "Wrong/invalid mobile Otp provided"
                });
            }

            // Here means both entered otp are correct
            // Set the userId and isAdmin in session
            (req.session as ISession).userId = userId;
            (req.session as ISession).isAdmin = isAdmin;

            console.log('req.session.userId', (req.session as ISession).userId);
            console.log('req.session.isAdmin', (req.session as ISession).isAdmin);

            // Set email_otp_verified and phone_otp_verified to true in users table for current user
            const userUpdated = await Users.query()
                .findById(userId)
                .patch({
                    email_otp_verified: true,
                    phone_otp_verified: true,
                });

            return res
                .status(200)
                .json({
                    err: null,
                    status: "Verified successfully",
                    userId: userId,
                    isAdmin: isAdmin
                });
        }
        else { // Here means userid provided is invalid 
            return res.status(403).json({
                err: "Invalid user"
            })
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
} // End of onVerifyEmailSmsOtpGet

module.exports = {
    onSlashGet,
    onLoginGet,
    onLoginPost,
    onSignUpGet,
    onSignUpPost,
    onLogoutGet,
    onVerifyEmailSmsOtpGet,
    onVerifyEmailSmsOtpPost
};

export {};