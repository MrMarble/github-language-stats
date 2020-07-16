FROM node:14-alpine AS base

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM base AS release

COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app/dist ./dist
COPY --from=base /usr/src/app/package.json ./

EXPOSE 8000

CMD ["npm", "start"]