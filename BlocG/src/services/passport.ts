import passport from 'passport';
import passportLocal from 'passport-local';
import { User } from '../models/user';

const LocalStrategy = passportLocal.Strategy;

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