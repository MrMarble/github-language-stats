import { getNumRepos, getLanguages } from "../services";
import {
  isValidUser,
  redisExistsAsync,
  redisGetAsync,
  redisClient,
  longCache,
} from "../utils";
import { Request, Response } from "express";

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @param {*} next 
 */
export async function getUserLanguages(req, res, next) {
  const userName = req.params.username;
  if (!isValidUser(userName)) {
    return res.status(400).send(`${userName} is not a valid Github user`);
  }
  try {
    if (await redisExistsAsync(userName)) {
      const data = await redisGetAsync(userName);
      return res.json(JSON.parse(data));
    } else {
      const repoCount = await getNumRepos(userName);
      const languages = await getLanguages(userName, repoCount);

      redisClient.set(userName, JSON.stringify(languages), "EX", longCache);

      return res.json(languages);
    }
  } catch (error) {
      console.error(error);
      next(error);
  }
}

export function getRoot(req, res, next) {
    res.redirect(301, process.env.npm_package_homepage);
}