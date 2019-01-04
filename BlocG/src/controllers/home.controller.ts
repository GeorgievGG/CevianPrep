import { Router, Request, Response } from 'express';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
    res.render('home.ejs');
});

export const HomeController: Router = router;