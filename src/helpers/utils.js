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
                languages[language.node.name] = {bytes:language.size, color:language.node.color};
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

export function parseLanguagesSVG(languages: languageJSON) {
    let languagesArray = [];
    let top = 10;
    for (const languageKey in languages) {
        if (Object.prototype.hasOwnProperty.call(languages, languageKey) && languageKey !== 'totalBytes') {
            const language = languages[languageKey];
            languagesArray.push(`<g transform="translate(10,${top})">
            <text xml:space="preserve" text-anchor="center" font-family="Helvetica, Arial, sans-serif" font-size="12" id="svg_2" y="0" x="0" fill-opacity="null" stroke-opacity="null" stroke-width="0" stroke="#000" fill="#000000">${languageKey}</text>
                <rect id="svg_3" height="10" width="${language.percent}%" y="3" x="0" stroke-opacity="null" fill="${language.color}"/>
                <text xml:space="preserve" text-anchor="center" font-family="Helvetica, Arial, sans-serif" font-size="10" id="svg_4" y="10" x="${language.percent + 1}%" fill-opacity="null" stroke-opacity="null" stroke-width="0" stroke="#000" fill="#000000">${language.percent}%</text>
            </g>`);
            top += 30;
        }
    }
    let svg = `<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
    <g>
${languagesArray.join('')}
    </g>
    </svg>`;

    return svg;
}
