import { Request, Response, Router } from 'express';
import { ContentResponse } from '../models/contentResponse';
import { RegistrationInput } from '../models/registrationInput';
import { registerUser } from '../services/userService';

const router: Router = Router();

router.post('/', (req: Request, res: Response) => {
  const inputModel: RegistrationInput = new RegistrationInput(req.body.name, req.body.username, req.body.password, req.body.email);
  registerUser(inputModel)
    .then((contentResponse: ContentResponse) => sendResponse(contentResponse, res))
    .catch((contentResponse: ContentResponse) => sendResponse(contentResponse, res))
});

function sendResponse(contentResponse: ContentResponse, res: Response) {
  return new Promise<void>(function () {
    res.status(contentResponse.statusCode).send(contentResponse.message);
  })
}

export const RegistrationController: Router = router;