import { NextFunction, Request, Response } from 'express';
import {
    colorRegex,
    isValidUser,
    longCache,
    redisClient,
    redisExistsAsync,
    redisGetAsync,
} from '../utils';
// @flow
import { getLanguages, getNumRepos } from '../services';

import { ErrorHandler } from '../helpers/error';
import {createHash} from 'crypto';
import { parseLanguagesSVG } from '../helpers/utils';

export async function getUserLanguages(req: Request, res: Response, next: NextFunction) {
    const userName = req.params.username;
    try {
        const format = req.query.format || 'json';
        const background = req.query.background;
        const filter = {
            minpercent: Number.parseFloat(req.query.minpercent) || 0
        };
        if (!isValidUser(userName)) {
            throw new ErrorHandler(400, `${userName} is not a valid Github user`);
        }
        let languages;
        const cacheKey = `${userName}:${createHash('md5').update(JSON.stringify(filter)).digest('hex')}`;
        if (await redisExistsAsync(cacheKey)) {
            languages = JSON.parse(await redisGetAsync(cacheKey));
        } else {
            console.log('getUserLanguages: generating info', userName, filter);
            const repoCount = await getNumRepos(userName);
            languages = await getLanguages(userName, repoCount,filter);
            redisClient.set(cacheKey, JSON.stringify(languages), 'EX', longCache);
        }
        switch (format) {
        case 'svg':
            res.set({'content-type': 'image/svg+xml'}).send(parseLanguagesSVG(languages, colorRegex.test(background)? background: ''));
            break;
        case 'json':
        default:
            res.json(languages);
            break;
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
}

export function getRoot(req: Request, res: Response) {
    res.redirect(301, process.env.npm_package_homepage);
}

export function notFound(req: Request, res: Response, next: NextFunction) {
    next(new ErrorHandler(404, ''));
}