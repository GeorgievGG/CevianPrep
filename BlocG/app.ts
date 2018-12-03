import express = require('express');
import ejs = require('ejs');
import bodyParser = require('body-parser');
import { HomeController, RegistrationController } from './Controllers';

const app: express.Application = express();
const port: number = 5068;
const renderEjsFile: Function = ejs.renderFile;
const urlEncodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();

app.engine('html', renderEjsFile);
app.set('view engine', 'html');
app.use(urlEncodedParser);
app.use(jsonParser);
app.use('/', HomeController);
app.use('/api/Register', RegistrationController);

app.listen(port, () => {
    console.log('Server launched!');
    console.log(`Listening at http://localhost:${port}/`);
});