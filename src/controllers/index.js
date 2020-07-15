import { NextFunction, Request, Response } from 'express';
// @flow
import { getLanguages, getNumRepos } from '../services';
import {
    isValidUser,
    longCache,
    redisClient,
    redisExistsAsync,
    redisGetAsync,
} from '../utils';

import { ErrorHandler } from '../helpers/error';
import { parseLanguagesSVG } from '../helpers/utils';

export async function getUserLanguages(req: Request, res: Response, next: NextFunction) {
    const userName = req.params.username;
    try {
        const format = req.query.format || 'json';      
        if (!isValidUser(userName)) {
            throw new ErrorHandler(400, `${userName} is not a valid Github user`);
        }
        let languages;
        if (await redisExistsAsync(userName)) {
            languages = JSON.parse(await redisGetAsync(userName));
        } else {
            const repoCount = await getNumRepos(userName);
            languages = await getLanguages(userName, repoCount);
            redisClient.set(userName, JSON.stringify(languages), 'EX', longCache);
        }
        switch (format) {
        case 'svg':
            res.set({'content-type': 'image/svg+xml'}).send(parseLanguagesSVG(languages));
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
