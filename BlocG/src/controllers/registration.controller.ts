import { Router, Request, Response } from 'express';
import { Model } from 'mongoose';
import { IUser } from '../interfaces/IUser';
import { IUserModel } from '../interfaces/IUserModel';
import { User } from '../models/user';
import { ContentResponse } from '../models/contentResponse';

const router: Router = Router();
const internalServerErrorMessage = 'Internal server error';

router.post('/', (req: Request, res: Response) => {
  createUser(req)
    .then((user: IUser) => usernameCheck(user))
    .then((user: IUser) => emailCheck(user))
    .then((user: IUser) => saveUser(user))
    .then((contentResponse: ContentResponse) => sendResponse(contentResponse, res))
    .catch((contentResponse: ContentResponse) => sendResponse(contentResponse, res));
});

export const RegistrationController: Router = router;

function createUser(req: Request) {
  return new Promise<IUser>(function(resolve) {
    var user: IUser = {
      name : req.body.name,
      username : req.body.username,
      password : req.body.password,
      email : req.body.email
    };

    resolve(user);
  })
}

function usernameCheck(user: IUser) {
  return new Promise<IUser>(function(resolve, reject) {
    User.find({ username: user.username }, function (err: Error, users: Model<IUserModel>[]) {
      if (err) {
        console.log(err);
        reject(new ContentResponse(500, internalServerErrorMessage));
      }
      else if (users.length != 0) {
        reject(new ContentResponse(409, `User ${user.username} already exists!`));
      }

      resolve(user);
    });
  })
}

function emailCheck(user: IUser) {
  return new Promise<IUser>(function(resolve, reject) {
    User.find({ email: user.email }, function (err: Error, users: Model<IUserModel>[]) {
      if (err) {
        console.log(err);
        reject(new ContentResponse(500, internalServerErrorMessage));
      }
      else if (users.length != 0) {
        reject(new ContentResponse(409, `User with email ${user.email} already exists!`));
      }

      resolve(user);
    });
  })
}

function saveUser(user: IUser) {
  return new Promise<ContentResponse>(function(resolve, reject) {
    new User(user).save(function (err: Error, user: IUser) {
      if (err) {
        console.log(err);
        reject(new ContentResponse(500, `User ${user.username} couldn't be registered!`));
      }
      else {
        console.log('User created: ' + user);
        resolve(new ContentResponse(200, `User ${user.username} successfully registered!`));
      }
    });
  })
}

function sendResponse(value: ContentResponse, res: Response) {
  return new Promise<void>(function() {
      res.status(500).send(value);
  })
}