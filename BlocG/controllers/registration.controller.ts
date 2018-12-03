import { Router, Request, Response } from 'express';

const router: Router = Router();

router.post('/', (req: Request, res: Response) => {
    var user = new User(req.body.name, 
                        req.body.username, 
                        req.body.password, 
                        req.body.email);
    res.send(`User ${user.username} with email ${user.email} tried to register!`);
});

export const RegistrationController: Router = router;