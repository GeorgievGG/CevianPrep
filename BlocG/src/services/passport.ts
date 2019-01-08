import passport from 'passport';
import passportJWT from 'passport-jwt';
import passportLocal from 'passport-local';
import { verify } from 'password-hash';
import { AuthenticationPayload } from '../models/authenticationPayload';
import { User } from '../models/user';

const LocalStrategy = passportLocal.Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

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
                return cb(null, user, { message: 'Logged In Successfully' });
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