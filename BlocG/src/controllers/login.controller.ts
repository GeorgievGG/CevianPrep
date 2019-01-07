import { Router, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { IUserModel } from '../interfaces/IUserModel';
import { ContentResponse } from '../models/contentResponse';

const router: Router = Router();
const unauthorizedErrorMessage = 'Unauthorized!';
const internalServerErrorMessage = 'Internal server error';

router.post('/', (req: Request, res: Response) => {
    authenticateUser(req, res)
    .then((user: IUserModel) => loginUser(user, req, res))
    .catch((contentResponse: ContentResponse) => sendResponse(contentResponse, res));
});

export const LoginController: Router = router;

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

            const token = jwt.sign(user.toJSON(), 'KzLKzLKzLKzL');
            res.json({ user, token });
        });
    })
}

function sendResponse(contentResponse: ContentResponse, res: Response) {
  return new Promise<void>(function() {
      res.status(contentResponse.statusCode).send(contentResponse.message);
  })
}