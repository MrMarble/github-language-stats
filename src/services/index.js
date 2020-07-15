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

type LanguageQuery = {
    data: {
        user: {
            repositories: {
                nodes: [
                    {
                        languages: {
                            edges: [
                                {
                                    size: number,
                                    node: {
                                        name: string,
                                    },
                                }
                            ],
                        },
                    }
                ],
            },
        },
    },
};

function parseLanguagesJSON(data: LanguageQuery) {
    let languages: {[language: string]: number} = {};
    let parsedLanguages: {[language: string]: {bytes: number,percent: number}, totalBytes: number} = {};

    data.data.user.repositories.nodes.forEach((repo) => {
        repo.languages.edges.forEach((language) => {
            if (language.node.name in languages) {
                languages[language.node.name] += language.size;
            } else {
                languages[language.node.name] = language.size;
            }
        });
    });

    let totalBytes = 0;
    Object.keys(languages).forEach(language => {
        totalBytes += languages[language];
    });

    Object.keys(languages).forEach((language) => {
        parsedLanguages[language] = {
            bytes: languages[language],
            percent: Number.parseFloat(((languages[language] * 100) / totalBytes).toFixed(2)),
        };
    });
    parsedLanguages.totalBytes = totalBytes;
    return parsedLanguages;
}

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
    if (data['data']['user']['repositories']['nodes'].length == 0) {
        throw new ErrorHandler(404, `${userName} does not have any public repositories`);
    }
    return parseLanguagesJSON(data);
}
