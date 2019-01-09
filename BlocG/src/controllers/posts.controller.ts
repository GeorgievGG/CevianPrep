import { Request, Response, Router } from 'express';
import { IPost } from '../interfaces/IPost';
import { AuthenticationPayload } from '../models/authenticationPayload';
import { ContentResponse } from '../models/contentResponse';
import { PostInput } from '../models/postInput';
import { authenticateUser } from '../services/authenticationService';
import { addPost, getAllPosts, getPostsByUsername } from '../services/postService';

const router: Router = Router();
const authenticationStrategy: string = 'jwt';

router.get('/posts', (req: Request, res: Response) => {
  authenticateUser(authenticationStrategy, req, res)
    .then(() => getAllPosts())
    .then((posts: IPost[]) => sendJsonResponse(posts, res))
    .catch((contentResponse: ContentResponse) => sendResponse(contentResponse, res));
});

router.get('/users/:username/posts', (req: Request, res: Response) => {
  authenticateUser(authenticationStrategy, req, res)
    .then(() => getPostsByUsername(req.params.username))
    .then((posts: IPost[]) => sendJsonResponse(posts, res))
    .catch((contentResponse: ContentResponse) => sendResponse(contentResponse, res));
});

router.post('/users/posts', (req: Request, res: Response) => {
  const inputModel: PostInput = new PostInput(req.body.created, req.body.content, req.body.title);
  authenticateUser(authenticationStrategy, req, res)
    .then((user: AuthenticationPayload) => addPost(user, inputModel))
    .then((contentResponse: ContentResponse) => sendResponse(contentResponse, res))
    .catch((contentResponse: ContentResponse) => sendResponse(contentResponse, res));
});

export const PostsController: Router = router;

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