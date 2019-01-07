import { Request, Response, Router } from 'express';
import { Model } from 'mongoose';
import passport from 'passport';
import { IPost } from '../interfaces/IPost';
import { IPostModel } from '../interfaces/IPostModel';
import { IUserModel } from '../interfaces/IUserModel';
import { ContentResponse } from '../models/contentResponse';
import { Post } from '../models/post';

const router: Router = Router();

router.post('/users/posts', (req: Request, res: Response) => {
  authenticateUser(req, res)
    .then((user: IUserModel) => createPost(user, req))
    .then((post: IPost) => savePost(post))
    .then((contentResponse: ContentResponse) => sendResponse(contentResponse, res))
    .catch((contentResponse: ContentResponse) => sendResponse(contentResponse, res));
});

export const PostsController: Router = router;

function authenticateUser(req: Request, res: Response) {
  return new Promise<IUserModel>(function (resolve, reject) {
    passport.authenticate('jwt', { session: false }, (err: Error, user: IUserModel) => {
      if (err || !user) {
        reject(new ContentResponse(401, 'Unauthorized'))
      };
      resolve(user);
    })(req, res);
  })
}

function createPost(user: IUserModel, req: Request) {
  return new Promise<IPost>(function (resolve) {
    let post: IPost = {
      created: req.body.created,
      content: req.body.content,
      title: req.body.title,
      user: user.id
    };

    resolve(post);
  })
}

function validatePost(post: IPost) {
  return new Promise<IPost>(function (resolve, reject) {
    Post.find({ created: post.created, user: post.user }, function (err: Error, posts: Model<IPostModel>[]) {
      if (err) {
        console.log(err);
        reject(new ContentResponse(500, 'Internal server error'));
      }
      else if (posts.length != 0) {
        reject(new ContentResponse(409, 'Post already exists!'));
      }

      resolve(post);
    });
  })
}

function savePost(post: IPost) {
  return new Promise<ContentResponse>(function (resolve, reject) {
    new Post(post).save(function (err: Error, post: IPost) {
      if (err) {
        console.log(err);
        reject(new ContentResponse(500, `Post ${post.content} couldn't be added!`));
      }
      else {
        console.log('Post created: ' + post);
        resolve(new ContentResponse(200, `Post ${post.content} successfully added!`));
      }
    });
  })
}

function sendResponse(value: ContentResponse, res: Response) {
  return new Promise<ContentResponse>(function () {
    res.status(value.statusCode).send(value.message);
  })
}