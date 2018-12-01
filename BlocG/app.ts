import express = require('express');
import { HomeController } from './Controllers';

const app: express.Application = express();
const port: number = 5068;
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/Home', HomeController);

app.listen(port, () => {
    console.log('Server launched!');
    console.log(`Listening at http://localhost:${port}/`);
});