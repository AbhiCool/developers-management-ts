"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const fsPromise = require('fs/promises');
const path = require('path');
const express = require("express");
const upload = require("../utils/multerSetup");
const router = express.Router();
// get middleware to check if user is logged in or not
const { checkIfLoggedIn } = require("../utils/customMiddlewares");
// Import needed model
const UserProfile = require('../db/models/userProfile');
router.get('/updateProfile', checkIfLoggedIn, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("In /updateProfile");
    console.log("req.session.userId", req.session.userId);
    let userProfileObj = {
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
        let userProfileObjFromTable = yield UserProfile.query().findOne({ user_id: req.session.userId });
        if (userProfileObjFromTable) {
            userProfileObj = Object.assign({}, userProfileObjFromTable);
        }
    }
    catch (err) {
        console.log(err);
    }
    userProfileObj.userId = req.session.userId;
    console.log('userProfileObj', userProfileObj);
    res.render('updateProfile', userProfileObj);
}));
router.patch('/updateProfile', checkIfLoggedIn, upload.single('updateProfileformAvatar'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        console.log('req.session.userId', req.session.userId);
        // Update the user profile
        const userProfileRecord = yield UserProfile.query()
            .findOne({ user_id: req.session.userId });
        console.log('userProfileRecord', userProfileRecord);
        if (!userProfileRecord) {
            yield UserProfile
                .query()
                .insert(Object.assign({ user_id: req.session.userId }, updateObj));
        }
        else {
            yield UserProfile
                .query()
                .findOne({ user_id: req.session.userId })
                .patch(updateObj);
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
    res.send({
        err: null,
        status: "Updated successfully"
    });
}));
router.get('/avatar/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    try {
        const profileUploadsPath = path.join(__dirname, '../', '../', 'profileUploads');
        console.log('profileUploadsPath', profileUploadsPath);
        // const fileExists = await fsPromise.access(profileUploadsPath, fs.F_OK)
        // if (!fileExists) {
        //     return res.pipe(fs.createReadStream(profileUploadsPath));
        // }
        const profileUploadsDirFiles = yield fsPromise.readdir(profileUploadsPath);
        console.log('profileUploadsDirFiles', profileUploadsDirFiles);
        const searchProfilePicFileArray = profileUploadsDirFiles.filter((profileUploadFile) => {
            return profileUploadFile.startsWith(userId + '_');
        });
        console.log('searchProfilePicFileArray', searchProfilePicFileArray);
        let maxTimeUploaded = 0;
        let searchProfilePicFile;
        searchProfilePicFileArray.forEach((file) => {
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
}));
module.exports = router;
