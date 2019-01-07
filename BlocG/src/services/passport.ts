import passport from 'passport';
import passportLocal from 'passport-local';
import passportJWT from 'passport-jwt';
import { User } from '../models/user';
import { IUserModel } from '../interfaces/IUserModel';

const LocalStrategy = passportLocal.Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, 
    function (username: string, password: string, cb: any) {
        return User.findOne({username: username, password: password})
            .then(user => {
                if (!user) {
                    return cb(null, false, {message: 'Incorrect email or password.'});
                }
                return cb(null, user, {message: 'Logged In Successfully'});
            })
            .catch(err => cb(err));
    }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey   : 'KzLKzLKzLKzL'
},
function (jwtPayload: IUserModel, cb: any) {
    //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
    return User.findById(jwtPayload._id)
        .then(user => {
            return cb(null, user);
        })
        .catch(err => {
            return cb(err);
        });
}
));