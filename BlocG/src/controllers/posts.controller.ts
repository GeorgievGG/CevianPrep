import { Request, Response, Router } from 'express';
import passport from 'passport';
import { IPost } from '../interfaces/IPost';
import { IPostModel } from '../interfaces/IPostModel';
import { IUserModel } from '../interfaces/IUserModel';
import { ContentResponse } from '../models/contentResponse';
import { Post } from '../models/post';
import { User } from '../models/user';
import { AuthenticationPayload } from '../models/authenticationPayload';

const router: Router = Router();
const internalServerErrorMessage = 'Internal server error';
const alreadyExistsErrorMessage = 'Post already exists';
const unauthorizedErrorMessage = 'Unauthorized!';

router.get('/posts', (req: Request, res: Response) => {
  authenticateUser(req, res)
    .then(() => getUsers(''))
    .then((users: IUserModel[]) => getPosts(users))
    .then((posts: IPost[]) => sendJsonResponse(posts, res))
    .catch((contentResponse: ContentResponse) => sendResponse(contentResponse, res));
});

router.get('/users/:username/posts', (req: Request, res: Response) => {
  authenticateUser(req, res)
    .then(() => getUsers(req.params.username))
    .then((users: IUserModel[]) => getPosts(users))
    .then((posts: IPost[]) => sendJsonResponse(posts, res))
    .catch((contentResponse: ContentResponse) => sendResponse(contentResponse, res));
});

router.post('/users/posts', (req: Request, res: Response) => {
  authenticateUser(req, res)
    .then((user: AuthenticationPayload) => createPost(user, req))
    .then((post: IPost) => validatePost(post))
    .then((post: IPost) => savePost(post))
    .then((contentResponse: ContentResponse) => sendResponse(contentResponse, res))
    .catch((contentResponse: ContentResponse) => sendResponse(contentResponse, res));
});

export const PostsController: Router = router;

function authenticateUser(req: Request, res: Response) {
  return new Promise<AuthenticationPayload>(function (resolve, reject) {
    passport.authenticate('jwt', { session: false }, (err: Error, user: AuthenticationPayload) => {
      if (err || !user) {
        reject(new ContentResponse(401, unauthorizedErrorMessage))
      };
      resolve(user);
    })(req, res);
  })
}

function getUsers(username: string) {
  return new Promise<IUserModel[]>(function (resolve, reject) {
    User.find(chooseUserSearchCondition(username), function (err: Error, users: IUserModel[]) {
      if (err) {
        console.log(err);
        reject(new ContentResponse(500, internalServerErrorMessage));
      }

      resolve(users);
    });
  })

  function chooseUserSearchCondition(username: string): any {
    const isFilteredByUsername = username != '';
    if (isFilteredByUsername) {
      return { username: username }
    }

    return {};
  }
}

function getPosts(users: IUserModel[]) {
  return new Promise<IPost[]>(function (resolve, reject) {
    Post.find(choosePostSearchCondition(users), function (err: Error, posts: IPostModel[]) {
      if (err) {
        console.log(err);
        reject(new ContentResponse(500, internalServerErrorMessage));
      }
      var simplePosts: IPost[] = posts.map(post => <IPost>{
        created: post.created,
        content: post.content,
        title: post.title,
        user: (<IUserModel>users.find(byId(post))).username
      });

      resolve(simplePosts);
    });
  })

  function byId(post: IPostModel): (value: IUserModel, index: number, obj: IUserModel[]) => boolean {
    return function (element: IUserModel) {
      return element._id == post.user;
    };
  }

  function choosePostSearchCondition(users: IUserModel[]): any {
    const isFilteredByUsername = users.length == 1;
    if (isFilteredByUsername) {
      return { user: users[0]._id }
    }

    return {};
  }
}

function createPost(user: AuthenticationPayload, req: Request) {
  return new Promise<IPost>(function (resolve) {
    let post: IPost = {
      created: req.body.created,
      content: req.body.content,
      title: req.body.title,
      user: user.userId
    };

    resolve(post);
  })
}

function validatePost(post: IPost) {
  return new Promise<IPost>(function (resolve, reject) {
    Post.find({ created: post.created, user: post.user }, function (err: Error, posts: IPostModel[]) {
      if (err) {
        console.log(err);
        reject(new ContentResponse(500, internalServerErrorMessage));
      }
      else if (posts.length != 0) {
        reject(new ContentResponse(409, alreadyExistsErrorMessage));
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
        reject(new ContentResponse(500, `Post \'${post.content}\' couldn't be added!`));
      }
      else {
        console.log('Post created: ' + post);
        resolve(new ContentResponse(200, `Post \'${post.content}\' successfully added!`));
      }
    });
  })
}

function sendJsonResponse(objectArray: Object[], res: Response) {
  return new Promise<void>(function () {
    res.json(objectArray);
  })
}

function sendResponse(value: ContentResponse, res: Response) {
  return new Promise<void>(function () {
    res.status(value.statusCode).send(value.message);
  })
}