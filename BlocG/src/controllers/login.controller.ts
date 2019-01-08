import { Request, Response, Router } from 'express';
import { AuthenticationPayload } from '../models/authenticationPayload';
import { ContentResponse } from '../models/contentResponse';
import { authenticateUser, generateToken } from '../services/authenticationService';

const router: Router = Router();
const internalServerErrorMessage: string = 'Internal server error';
const requiredErrorMessage: string = 'data is required!';
const authenticationStrategy: string = 'local';

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

            generateToken(JSON.stringify(user), 'KzLKzLKzLKzL')
                .then((output: string) => {
                    res.json({ user, output })
                });
        });
    })
}

function sendResponse(contentResponse: ContentResponse, res: Response) {
    return new Promise<void>(function () {
        res.status(contentResponse.statusCode).send(contentResponse.message);
    })
}