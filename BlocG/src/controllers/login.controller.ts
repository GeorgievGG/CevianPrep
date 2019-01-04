import { Router, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { IUserModel } from '../interfaces/IUserModel';

const router: Router = Router();

router.post('/', (req: Request, res: Response) => {
    passport.authenticate('local', {session: false}, (err: Error, user: IUserModel, info: string) => {
        if (err || !user) {
            return res.status(400).json({
                message: 'Something is not right',
                user   : user
            });
        }

        req.login(user, {session: false}, (err: Error) => {
           if (err) {
               res.send(err);
           }

           const token = jwt.sign(user.toJSON(), 'KzLKzLKzLKzL');
           return res.json({user, token});
        });
    })(req, res);
});

export const LoginController: Router = router;