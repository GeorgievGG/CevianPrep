import express from 'express';

const app: express.Application = express();
const port: number = 5068;

app.listen(port, () => {
    console.log('Server launched!');
    console.log(`Listening at http://localhost:${port}/`);
});