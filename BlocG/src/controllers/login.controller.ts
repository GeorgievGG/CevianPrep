import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationPayload } from '../models/authenticationPayload';
import { ContentResponse } from '../models/contentResponse';
import { authenticateUser } from '../services/authenticationService';

const router: Router = Router();
const requiredErrorMessage = 'data is required!';
const authenticationStrategy: string = 'local';
const internalServerErrorMessage = 'Internal server error';

router.post('/', (req: Request, res: Response) => {
    validateUsername(req)
        .then(() => validatePassword(req))
        .then(() => authenticateUser(authenticationStrategy, req, res))
        .then((user: AuthenticationPayload) => loginUser(user, req, res))
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

function loginUser(user: AuthenticationPayload, req: Request, res: Response) {
    return new Promise<void>(function (resolve, reject) {
        req.login(user, { session: false }, (err: Error) => {
            if (err) {
                reject(new ContentResponse(500, internalServerErrorMessage));
            }
            const token = jwt.sign(JSON.stringify(user), 'KzLKzLKzLKzL'); //extract as a promise
            res.json({ user, token });
        });
    })
}

function sendResponse(contentResponse: ContentResponse, res: Response) {
    return new Promise<void>(function () {
        res.status(contentResponse.statusCode).send(contentResponse.message);
    })
}