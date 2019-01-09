import { Request, Response, Router } from 'express';
import { IPost } from '../interfaces/IPost';
import { IPostModel } from '../interfaces/IPostModel';
import { IUserModel } from '../interfaces/IUserModel';
import { AuthenticationPayload } from '../models/authenticationPayload';
import { ContentResponse } from '../models/contentResponse';
import { Post } from '../models/post';
import { authenticateUser } from '../services/authenticationService';
import { getAllUsers, getUserByUsername } from '../services/userService';

const router: Router = Router();
const authenticationStrategy: string = 'jwt';
const internalServerErrorMessage: string = 'Internal server error';
const alreadyExistsErrorMessage: string = 'Post already exists';
const requiredErrorMessage: string = 'is required!';

router.get('/posts', (req: Request, res: Response) => {
  authenticateUser(authenticationStrategy, req, res)
    .then(() => getAllUsers())
    .then((users: IUserModel[]) => getPosts(users))
    .then((posts: IPost[]) => sendJsonResponse(posts, res))
    .catch((contentResponse: ContentResponse) => sendResponse(contentResponse, res));
});

router.get('/users/:username/posts', (req: Request, res: Response) => {
  authenticateUser(authenticationStrategy, req, res)
    .then(() => getUserByUsername(req.params.username))
    .then((users: IUserModel[]) => getPosts(users))
    .then((posts: IPost[]) => sendJsonResponse(posts, res))
    .catch((contentResponse: ContentResponse) => sendResponse(contentResponse, res));
});

router.post('/users/posts', (req: Request, res: Response) => {
  authenticateUser(authenticationStrategy, req, res)
    .then((user: AuthenticationPayload) => validateCreated(user, req))
    .then((user: AuthenticationPayload) => validateContent(user, req))
    .then((user: AuthenticationPayload) => validateTitle(user, req))
    .then((user: AuthenticationPayload) => createPost(user, req))
    .then((post: IPost) => validatePost(post))
    .then((post: IPost) => savePost(post))
    .then((contentResponse: ContentResponse) => sendResponse(contentResponse, res))
    .catch((contentResponse: ContentResponse) => sendResponse(contentResponse, res));
});

export const PostsController: Router = router;

function validateCreated(user: AuthenticationPayload, req: Request) {
  return new Promise<AuthenticationPayload>(function (resolve, reject) {
    if (!req.body.created) {
      reject(new ContentResponse(400, `Created date ${requiredErrorMessage}`));
    }
    resolve(user);
  });
}

function validateContent(user: AuthenticationPayload, req: Request) {
  return new Promise<AuthenticationPayload>(function (resolve, reject) {
    if (!req.body.content) {
      reject(new ContentResponse(400, `Content ${requiredErrorMessage}`));
    }
    resolve(user);
  });
}

function validateTitle(user: AuthenticationPayload, req: Request) {
  return new Promise<AuthenticationPayload>(function (resolve, reject) {
    if (!req.body.title) {
      reject(new ContentResponse(400, `Title ${requiredErrorMessage}`));
    }
    resolve(user);
  });
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
    });
    if (!post.user) {
      reject(new ContentResponse(400, `Username ${requiredErrorMessage}`));
    }

    resolve(post);
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