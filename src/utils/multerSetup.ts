const multer = require('multer');
const path = require('path');

import {Request} from 'express';

const storage = multer.diskStorage({
    destination: function (req:Request, file:any, cb:(err: any, dest:string) => void) {
        cb(null, path.join('___dirname', '../', '/profileUploads'));
    },
    filename: async function (req:Request, file:any, cb:(err: any, fileName:string) => void) {
        console.log(file);
        const fileExt = file.originalname.split('.').pop();

        cb(null, req.body.userId + '_' + Date.now() + '.' + fileExt);
    }
})

module.exports = multer({ storage: storage })