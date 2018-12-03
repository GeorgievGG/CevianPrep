import express = require('express');
import ejs = require('ejs');
import { HomeController } from './Controllers';

const app: express.Application = express();
const port: number = 5068;
const renderEjsFile: Function = ejs.renderFile;

app.engine('html', renderEjsFile);
app.set('view engine', 'html');

app.use('/', HomeController);

app.listen(port, () => {
    console.log('Server launched!');
    console.log(`Listening at http://localhost:${port}/`);
});