import {Request, Response, NextFunction} from 'express';
import { ISession } from '../types/issession';

function checkIfLoggedIn(req: Request, res: Response, next: NextFunction) {
    console.log('req.session.userId in checkIfLoggedIn', (req.session as ISession).userId);
    if ((req.session as ISession).userId)
        return next();

    res.redirect('/login');
}


function checkIfDeleteMethodIsAllowed(req: Request, res: Response, next: NextFunction) {
    console.log("In checkIfDeleteMethodIsAllowed");
    console.log("req.method", req.method);
    console.log("req.session.isAdmin",(req.session as ISession).isAdmin);

    if (req.method === 'DELETE' && !(req.session as ISession).isAdmin) {
        return res.status(405).send("Delete method not allowed");
    }
    next();
}

function checkIfAdmin(req: Request, res: Response, next:NextFunction) {
    console.log("In checkIfAdmin");
    if (!(req.session as ISession).isAdmin) {
        return res.status(403).send("Not allowed");
    }
    next();
}

module.exports = {
    checkIfLoggedIn,
    checkIfDeleteMethodIsAllowed,
    checkIfAdmin
};