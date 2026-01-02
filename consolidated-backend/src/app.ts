import express from 'express';
import bodyParser from 'body-parser';
import workDayController from './controllers/WorkDayController';
import rideController from './controllers/RideController';

const app = express();

app.use(bodyParser.json());

app.use('/api', workDayController);
app.use('/api', rideController);

export default app;
