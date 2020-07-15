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

export async function getUserLanguages(req: Request, res: Response, next: NextFunction) {
    const userName = req.params.username;
    try {
        if (!isValidUser(userName)) {
            throw new ErrorHandler(400, `${userName} is not a valid Github user`);
        }
        if (await redisExistsAsync(userName)) {
            const data = await redisGetAsync(userName);
            return res.json(JSON.parse(data));
        } else {
            const repoCount = await getNumRepos(userName);
            const languages = await getLanguages(userName, repoCount);

            redisClient.set(userName, JSON.stringify(languages), 'EX', longCache);

            return res.json(languages);
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
}

export function getRoot(req: Request, res: Response) {
    res.redirect(301, process.env.npm_package_homepage);
}
