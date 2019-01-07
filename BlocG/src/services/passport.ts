import passport from 'passport';
import passportJWT from 'passport-jwt';
import passportLocal from 'passport-local';
import { IUserModel } from '../interfaces/IUserModel';
import { User } from '../models/user';

const LocalStrategy = passportLocal.Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
},
    function (username: string, password: string, cb: any) {
        return User.findOne({ username: username, password: password })
            .then(user => {
                if (!user) {
                    return cb(null, false, { message: 'Incorrect email or password.' });
                }
                return cb(null, user, { message: 'Logged In Successfully' });
            })
            .catch(err => cb(err));
    }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'KzLKzLKzLKzL'
},
    function (jwtPayload: IUserModel, cb: any) {
        if (!jwtPayload) {
            return cb(new Error("No payload found."));
        }

        return cb(null, jwtPayload);
    }
));