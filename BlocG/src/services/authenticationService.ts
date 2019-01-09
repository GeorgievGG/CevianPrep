import { Request, Response } from 'express';
import passport from 'passport';
import passportJWT from 'passport-jwt';
import passportLocal from 'passport-local';
import { verify } from 'password-hash';
import { AuthenticationPayload } from '../models/authenticationPayload';
import { ContentResponse } from '../models/contentResponse';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';

const LocalStrategy = passportLocal.Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const unauthorizedErrorMessage: string = 'Unauthorized!';
const internalServerErrorMessage: string = 'Internal server error';

export function authenticateUser(stategyCode: string, req: Request, res: Response) {
    return new Promise<AuthenticationPayload>(function (resolve, reject) {
        passport.authenticate(stategyCode, { session: false }, (err: Error, user: AuthenticationPayload) => {
            if (err || !user) {
                reject(new ContentResponse(401, unauthorizedErrorMessage))
            };
            resolve(user);
        })(req, res);
    })
}

export function generateToken(json: string, salt: string) {
    return new Promise<string>(function (resolve, reject) {
        try {
            const token: string = jwt.sign(json, salt);
            resolve(token);
        }
        catch {
            reject(new ContentResponse(500, internalServerErrorMessage));
        }
    })
}

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
},
    function (username: string, password: string, cb: any) {
        return User.findOne({ username: username })
            .then(user => {
                if (!(user && verify(password, user.password.toString()))) {
                    return cb(null, false, { message: 'Incorrect email or password.' });
                }
                return cb(null, new AuthenticationPayload(user._id, user.username.toString()), { message: 'Logged In Successfully' });
            })
            .catch(err => cb(err));
    }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'KzLKzLKzLKzL'
},
    function (jwtPayload: AuthenticationPayload, cb: any) {
        if (!jwtPayload) {
            return cb(new Error("No payload found."));
        }

        return cb(null, jwtPayload);
    }
));