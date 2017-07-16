import * as express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import * as methodOverride from 'method-override';
import * as cors from 'cors';

import { CONFIG } from './config';

mongoose.connect(CONFIG.MONGO_URI);
const mongoDB = mongoose.connection;

mongoDB.on('error', () => {
    console.error('MongoDB connection error. Please make sure that ', CONFIG.MONGO_URI, ' is running');
});

mongoDB.once('open', () => {
    console.log('Connected to MongoDB: ', CONFIG.MONGO_URI);
})


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(cors());

const port = process.env.PORT || '8083';
app.set('port', port);


if (process.env.NODE_ENV !== 'dev') {
    app.use('/', express.static(path.join(__dirname, '../../dist')));
}

require('./api')(app, CONFIG);

if (process.env.NODE_ENV !== 'dev') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../dist/index.html'));
    });
}

app.listen(port, () => console.log(`Server running on localhost:${port}`));
