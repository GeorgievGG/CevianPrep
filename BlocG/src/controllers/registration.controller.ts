import { Router, Request, Response } from 'express';
import { IUser } from '../interfaces/IUser';
import { IUserModel } from '../models';
import { Model, model } from 'mongoose';
var User : Model<IUserModel> = model('User'); 

const router: Router = Router();

router.post('/', (req: Request, res: Response) => {
    let user: IUser = {
        name : req.body.name,
        username : req.body.username,
        password : req.body.password,
        email : req.body.email
    };
    
    new User(user).save(function(err: Error, user: IUser) {
        var strOutput;
        if (err) {
          console.log(err);
          strOutput = `User ${user.username} couldn't be registered!`;
        } else {
          console.log('User created: ' + user);
          strOutput = `User ${user.username} successfully registered!`;
        }
        res.send(strOutput);
      });
});

export const RegistrationController: Router = router;