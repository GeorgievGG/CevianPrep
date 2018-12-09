import { Router, Request, Response } from 'express';
import { IUserModel } from '../models';
var mongoose = require("mongoose");
var User = mongoose.model('User'); 

const router: Router = Router();

router.post('/', (req: Request, res: Response) => {
    var user = User.create({
        name : req.body.name,
        username : req.body.username,
        password : req.body.password,
        email : req.body.email
      }).save(function(err: Error, user: IUserModel) {
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