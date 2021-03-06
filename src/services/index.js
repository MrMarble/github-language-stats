// @flow

import { longCache, redisClient, redisExistsAsync, redisGetAsync } from '../utils';

import { ErrorHandler } from '../helpers/error';
import fetch from 'node-fetch';
import { parseLanguagesJSON } from '../helpers/utils';

const GITHUB_API = 'https://api.github.com/graphql';

const TOKEN = process.env.GITHUB_TOKEN || '';

if (TOKEN == '') {
    console.error('You forgot to set the GITHUB_TOKEN variable');
    process.exit(1);
}

const queryNumRepos = `query($userName:String!) {
    user(login: $userName) {
      repositories(isFork: false) {
        totalCount
      }
    }
  }`;

const queryLanguages = `query($userName:String!, $repoCount: Int!) {
    user(login: $userName) {
      repositories(first: $repoCount, isFork: false) {
        nodes {
          languages(first: 50) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    }
  }`;

export async function getNumRepos(userName: string) {
    if (await redisExistsAsync(`numrepos:${userName}`)) {
        return await redisGetAsync(`numrepos:${userName}`);
    }
    console.log('getNumRepos: fetching github api',userName);
    const r = await fetch(GITHUB_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `bearer ${TOKEN}`,
        },
        body: JSON.stringify({
            query: queryNumRepos,
            variables: { userName },
        }),
    });
    const data = await r.json();
    if ('errors' in data || !('data' in data)) {
        console.error(data);
        throw new ErrorHandler(404, 'User not found');
    }
    redisClient.set(`numrepos:${userName}`, data['data']['user']['repositories']['totalCount'], 'EX', longCache);
    return data['data']['user']['repositories']['totalCount'];
}

export async function getLanguages(userName: string, repoCount: number, filter: {minpercent: number}) {
    if (await redisExistsAsync(`languages:${userName}`)) {
        return parseLanguagesJSON(JSON.parse(await redisGetAsync(`languages:${userName}`)), filter);
    }
    console.log('getLanguages: fetching github api',userName);
    const r = await fetch(GITHUB_API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `bearer ${TOKEN}`,
        },
        body: JSON.stringify({
            query: queryLanguages,
            variables: { userName, repoCount },
        }),
    });
    const data = await r.json();
    if ('errors' in data) {
        throw new ErrorHandler(404, 'Github is doing something weird with this user');
    }
    if (data['data']['user']['repositories']['nodes'].length == 0) {
        throw new ErrorHandler(404, `${userName} does not have any public repositories`);
    }
    redisClient.set(`languages:${userName}`, JSON.stringify(data), 'EX', longCache);
    return parseLanguagesJSON(data, filter);
}
