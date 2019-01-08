import { Router, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { IUserModel } from '../interfaces/IUserModel';
import { ContentResponse } from '../models/contentResponse';
import { AuthenticationPayload } from '../models/authenticationPayload';

const router: Router = Router();
const requiredErrorMessage = 'data is required!';
const unauthorizedErrorMessage = 'Unauthorized!';
const internalServerErrorMessage = 'Internal server error';

router.post('/', (req: Request, res: Response) => {
    validateUsername(req)
        .then(() => validatePassword(req))
        .then(() => authenticateUser(req, res))
        .then((user: IUserModel) => loginUser(user, req, res))
        .catch((contentResponse: ContentResponse) => sendResponse(contentResponse, res));
});

export const LoginController: Router = router;

function validateUsername(req: Request) {
    return new Promise<void>(function (resolve, reject) {
        if (!req.body.username) {
            reject(new ContentResponse(400, `Username ${requiredErrorMessage}`));
        }
        resolve();
    });
}

function validatePassword(req: Request) {
    return new Promise<void>(function (resolve, reject) {
        if (!req.body.password) {
            reject(new ContentResponse(400, `Password ${requiredErrorMessage}`));
        }
        resolve();
    });
}

function authenticateUser(req: Request, res: Response) {
    return new Promise<IUserModel>(function (resolve, reject) {
        passport.authenticate('local', { session: false }, (err: Error, user: IUserModel, info: string) => {
            if (err || !user) {
                reject(new ContentResponse(401, unauthorizedErrorMessage));
            }
            resolve(user);
        })(req, res);
    })
}

function loginUser(user: IUserModel, req: Request, res: Response) {
    return new Promise<void>(function (resolve, reject) {
        req.login(user, { session: false }, (err: Error) => {
            if (err) {
                reject(new ContentResponse(500, internalServerErrorMessage));
            }
            var payload: AuthenticationPayload = new AuthenticationPayload(user._id, user.username.toString());
            const token = jwt.sign(JSON.stringify(payload), 'KzLKzLKzLKzL'); //extract as a promise
            res.json({ payload, token });
        });
    })
}

function sendResponse(contentResponse: ContentResponse, res: Response) {
    return new Promise<void>(function () {
        res.status(contentResponse.statusCode).send(contentResponse.message);
    })
}