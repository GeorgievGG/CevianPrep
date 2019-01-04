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

    usernameCheck(user, res)
    .then(() => emailCheck(user, res))
    .then(() => saveUser(user, res))
    .then((value: string) => sendOkResponse(value, res))
    .catch((value: string) => sendErrorResponse(value, res));
});

export const RegistrationController: Router = router;

function usernameCheck(user: IUser, res: Response) {
  return new Promise<string>(function(resolve, reject) {
    User.find({ username: user.username }, function (err: Error, users: Model<IUserModel>[]) {
      if (err) {
        console.log(err);
        reject('Internal server error');
      }
      else if (users.length != 0) {
        reject(`User ${user.username} already exists!`);
      }
      resolve('');
    });
  })
}

function emailCheck(user: IUser, res: Response) {
  return new Promise<string>(function(resolve, reject) {
    User.find({ email: user.email }, function (err: Error, users: Model<IUserModel>[]) {
      if (err) {
        console.log(err);
        reject('Internal server error');
      }
      else if (users.length != 0) {
        reject(`User with email ${user.email} already exists!`);
      }
      resolve('');
    });
  })
}

function saveUser(user: IUser, res: Response) {
  return new Promise<string>(function(resolve, reject) {
    new User(user).save(function (err: Error, user: IUser) {
      if (err) {
        console.log(err);
        reject(`User ${user.username} couldn't be registered!`);
      }
      else {
        console.log('User created: ' + user);
        resolve(`User ${user.username} successfully registered!`);
      }
    });
  })
}

function sendOkResponse(value: string, res: Response) {
  return new Promise<string>(function(resolve, reject) {
      res.send(value);
  })
}

function sendErrorResponse(value: string, res: Response) {
  return new Promise<string>(function(resolve, reject) {
      res.status(500).send(value);
  })
}