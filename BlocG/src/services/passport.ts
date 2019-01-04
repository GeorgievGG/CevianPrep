import passport from 'passport';
import { Strategy } from 'passport-local';
import { User } from '../models/user';

passport.use(new Strategy({
        usernameField: 'email',
        passwordField: 'password'
    }, 
    function (email: string, password: string, cb) {
        return User.findOne({email: email, password: password})
            .then(user => {
                if (!user) {
                    return cb(null, false, {message: 'Incorrect email or password.'});
                }
                return cb(null, user, {message: 'Logged In Successfully'});
            })
            .catch(err => cb(err));
    }
));