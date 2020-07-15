// @flow

import { ErrorHandler } from '../helpers/error';
import fetch from 'node-fetch';

const GITHUB_API = 'https://api.github.com/graphql';

const TOKEN = process.env.GITHUB_TOKEN || '';

if (TOKEN == '') {
    console.error('You forgot to set the GITHUB_TOKEN variable');
    process.exit(1);
}

const queryNumRepos = `query($userName:String!) {
    user(login: $userName) {
      repositories {
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
              }
            }
          }
        }
      }
    }
  }`;

export async function getNumRepos(userName: string) {
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
    if ('errors' in data) {
        throw new ErrorHandler(404, 'User not found');
    }
    return data['data']['user']['repositories']['totalCount'];
}

export async function getLanguages(userName: string, repoCount: number) {
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
    let languages = {};
    if (data['data']['user']['repositories']['nodes'].length == 0) {
        throw new ErrorHandler(404, `${userName} does not have any public repositories`);
    }
    data['data']['user']['repositories']['nodes'].forEach((element) => {
        element['languages']['edges'].forEach((l) => {
            l['node']['name'] in languages
                ? (languages[l['node']['name']] =
            languages[l['node']['name']] + l['size'])
                : (languages[l['node']['name']] = l['size']);
        });
    });

    const totalBytes = Number.parseInt(Object.keys(languages).reduce((acc, cur) => {
        if (typeof acc == 'string') {
            return (acc = languages[acc] + languages[cur]);
        } else {
            return (acc += +languages[cur]);
        }
    }));

    let result = {};
    Object.keys(languages).forEach((language) => {
        result[language] = {
            bytes: languages[language],
            percent: ((languages[language] * 100) / totalBytes).toFixed(2),
        };
    });
    result.totalBytes = +totalBytes;
    return result;
}
