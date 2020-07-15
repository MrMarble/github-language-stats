import { createClient } from "redis";
import { promisify } from "util";

const redisClient = createClient({
  host: "redis",
});
const redisGetAsync = promisify(redisClient.get).bind(redisClient);
const redisExistsAsync = promisify(redisClient.exists).bind(redisClient);


const githubRegex = new RegExp(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i);
const isValidUser = (userName) => githubRegex.test(userName);


const longCache = 60 * 60 * 24;
const shortCache = 60 * 60;

export { redisClient, redisExistsAsync, redisGetAsync, isValidUser, longCache, shortCache };
