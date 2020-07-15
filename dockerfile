FROM node:14-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY dist dist

EXPOSE 8000

CMD ["npm", "start"]