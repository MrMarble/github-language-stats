// @flow
import { longCache, shortCache } from './utils';

import express from 'express';
import expressRateLimit from 'express-rate-limit';
import expressSlowDown from 'express-slow-down';
import { handleError } from './helpers/error';
import routes from './routes';

const PORT = 8000;

const app = express();

const rateLimit = expressRateLimit({
    windowMs: shortCache * 1000,
    max: 50,
});

const speedLimit = expressSlowDown({
    windowMs: shortCache * 1000,
    delayAfter: 10,
    delayMs: 100,
});

const cacheControl = (req, res, next) => {
    res.set('Cache-Control', `public, max-age=${longCache}`);
    next();
};

app.use(rateLimit, speedLimit, cacheControl);
app.use(routes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    handleError(err,res);
});

app.listen(PORT, () => {
    const version = process.env.npm_package_version || 'broken';
    console.info(`Server listening on port ${PORT}. Version ${version}`);
});
