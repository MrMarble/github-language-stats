// @flow

type languageQuery = {
    data: {
        user: {
            repositories: {
                nodes: [
                    {
                        languages: {
                            edges: [{ size: number, node: { name: string, color: string } }],
                        },
                    }
                ],
            },
        },
    },
};

type languageJSON = {
    [language: string]: { bytes: number, percent: number, color: string },
    totalBytes: number,
};

export function parseLanguagesJSON(data: languageQuery) {
    let languages: { [language: string]: {bytes: number, color: string} } = {};
    let parsedLanguages: languageJSON = {};

    data.data.user.repositories.nodes.forEach((repo) => {
        repo.languages.edges.forEach((language) => {
            if (language.node.name in languages) {
                languages[language.node.name].bytes += language.size;
            } else {
                languages[language.node.name] = {bytes:language.size, color:language.node.color || '#3a1'};
            }
        });
    });

    let totalBytes = 0;
    Object.keys(languages).forEach((language) => {
        totalBytes += languages[language].bytes;
    });

    Object.keys(languages).forEach((language) => {
        parsedLanguages[language] = {
            bytes: languages[language].bytes,
            percent: Number.parseFloat(((languages[language].bytes * 100) / totalBytes).toFixed(2)),
            color: languages[language].color
        };
    });
    
    parsedLanguages.totalBytes = totalBytes;
    return parsedLanguages;
}

export function parseLanguagesSVG(languages: languageJSON, background: string) {
    let languagesArray = [];
    const sortedLanguages = Object.keys(languages).filter(language=> language !== 'totalBytes').sort((a,b) => {
        //$FlowFixMe
        return languages[b].bytes - languages[a].bytes;
    });
    let top = 25;
    for (const languageKey of sortedLanguages) {
        if (Object.prototype.hasOwnProperty.call(languages, languageKey) && languageKey !== 'totalBytes') {
            const language = languages[languageKey];
            languagesArray.push(`<g transform="translate(25,${top})" fill="none">
            <text xml:space="preserve" text-anchor="center" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji" font-size="12" id="svg_2" y="0" x="0" fill-opacity="null" stroke-opacity="null" stroke-width="0" stroke="#000" fill="#000000">${languageKey}</text>
            <svg height="10" width="200" y="3" x="0" fill="#ccc">
                <rect id="svg_3" height="10" width="100%" y="0" x="0" stroke-opacity="null" fill="#ddd"/>
                <rect id="svg_3" height="10" width="${language.percent< 5 ? language.percent+1 : language.percent}%" y="0" x="0" stroke-opacity="null" fill="${language.color}"/>
            </svg>
            <text xml:space="preserve" text-anchor="center" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji" font-size="10" id="svg_4" y="11" x="205" fill-opacity="null" stroke-opacity="null" stroke-width="0" stroke="#000" fill="#000000">${language.percent}%</text>
            </g>`);
            top += 30;
        }
    }
    let svg = `<svg width="300" height="${(30 * languagesArray.length) + 30}" xmlns="http://www.w3.org/2000/svg" >
        ${background && `<rect id="svg_3" height="100%" width="100%" y="0" x="0" stroke-opacity="null" fill="${background}"/>`}
        ${languagesArray.join('')}
    </svg>`;

    return svg;
}
