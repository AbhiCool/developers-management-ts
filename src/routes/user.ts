const fs = require('fs');
const fsPromise = require('fs/promises');
const path = require('path');

const express = require("express");
import {Request, Response} from 'express';
import { ISession } from '../types/issession';

const upload = require("../utils/multerSetup");
const router = express.Router();

// get middleware to check if user is logged in or not
const { checkIfLoggedIn } = require("../utils/customMiddlewares");

// Import needed model
const UserProfile = require('../db/models/userProfile');


router.get('/updateProfile', checkIfLoggedIn, async (req: Request, res: Response) => {
    console.log("In /updateProfile");
    console.log("req.session.userId", (req.session as ISession).userId);

    type UserProfileObj = {
        address: string,
        age: string,
        gender: string,
        work_exp: string,
        present_company: string,
        current_ctc: string,
        employment_status: string,
        available_to_hire: string,
        available_to_freelance: string,
        userId?: number
    }
    let userProfileObj: UserProfileObj = {
        address: '',
        age: '',
        gender: '',
        work_exp: '',
        present_company: '',
        current_ctc: '',
        employment_status: '',
        available_to_hire: '',
        available_to_freelance: ''
    };
    try {
        let userProfileObjFromTable = await UserProfile.query().findOne({ user_id: (req.session as ISession).userId });

        if (userProfileObjFromTable) {
            userProfileObj = { ...userProfileObjFromTable };
        }
    }
    catch (err) {
        console.log(err);
    }

    userProfileObj.userId = (req.session as ISession).userId;

    console.log('userProfileObj', userProfileObj);
    res.render('updateProfile', userProfileObj);
})

router.patch('/updateProfile',
    checkIfLoggedIn,
    upload.single('updateProfileformAvatar'),
    async (req: Request, res: Response) => {
        console.log('req.body', req.body);
        console.log('req.file', req.file);

        try {
            const updateObj = {
                address: req.body.updateProfileAddress,
                age: req.body.updateProfileAge,
                gender: req.body.updateProfileGender,
                work_exp: req.body.updateProfileWorkExp,
                present_company: req.body.updateProfilePresentCompany,
                current_ctc: req.body.updateProfileCurrentCTC,
                employment_status: req.body.updateProfileEmpStatus,
                available_to_hire: req.body.updateProfileAvailableToHire ? true : false,
                available_to_freelance: req.body.updateProfileAvailableToFreelance ? true : false,
            };

            console.log('req.session.userId', (req.session as ISession).userId);

            // Update the user profile
            const userProfileRecord = await UserProfile.query()
                .findOne({ user_id: (req.session as ISession).userId });

            console.log('userProfileRecord', userProfileRecord);

            if (!userProfileRecord) {
                await UserProfile
                    .query()
                    .insert({
                        user_id: (req.session as ISession).userId,
                        ...updateObj
                    })
            }
            else {
                await UserProfile
                    .query()
                    .findOne({ user_id: (req.session as ISession).userId })
                    .patch(updateObj)
            }
        }
        catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.send({
            err: null,
            status: "Updated successfully"
        })
    })

router.get('/avatar/:userId', async (req: Request, res: Response) => {
    const userId = req.params.userId;

    try {
        const profileUploadsPath = path.join(__dirname,  '../', '../', 'profileUploads');
        console.log('profileUploadsPath', profileUploadsPath);

        // const fileExists = await fsPromise.access(profileUploadsPath, fs.F_OK)
        // if (!fileExists) {
        //     return res.pipe(fs.createReadStream(profileUploadsPath));
        // }

        const profileUploadsDirFiles = await fsPromise.readdir(profileUploadsPath);
        console.log('profileUploadsDirFiles', profileUploadsDirFiles);

        const searchProfilePicFileArray = profileUploadsDirFiles.filter((profileUploadFile:string) => {
            return profileUploadFile.startsWith(userId +'_');
        });

        console.log('searchProfilePicFileArray', searchProfilePicFileArray);

        let maxTimeUploaded = 0;
        let searchProfilePicFile;

        searchProfilePicFileArray.forEach((file: string) => {
            console.log('file', file);
            const fileName = file.split('.')[0];
            const timeUploadedOfFile = parseInt(fileName.split("_")[1]);

            console.log('timeUploadedOfFile', timeUploadedOfFile);

            if (timeUploadedOfFile > maxTimeUploaded) {
                maxTimeUploaded = timeUploadedOfFile;
                
                searchProfilePicFile = file;
            }
        });

        console.log('searchProfilePicFile', searchProfilePicFile);

        if (searchProfilePicFile) {
            return res.sendFile(path.join(profileUploadsPath, searchProfilePicFile));
        }

        return res.sendFile(path.join(profileUploadsPath, '0.png'));
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});
module.exports = router;

export {};