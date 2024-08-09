import compression from 'compression';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { corsMiddleware } from './cors';
import { initModules } from './init';

export const api = express();

api.use(helmet());
api.use(compression());
api.use(express.json());
api.use(corsMiddleware);
// Simple Logging
api.use((req, res, next) => {
    let operationName = '';

    if (req.url.includes('/graphql')) {
        operationName = req.body['operationName'];
    }
    if (req.url.includes('/healthcheck')) {
        //? omit logging healthcheck
        next();
        return;
    }
    console.log(`${req?.method?.toUpperCase()} ${req.url} ${operationName}`);
    next();
});

initModules(api).then(() => {
    console.log('Modules Initialized');

    if (process.env.LOCAL) {
        api.listen(5001, () => console.log('🚀 ~ Listening at port:', 5001));
    }
});
