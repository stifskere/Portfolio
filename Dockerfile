FROM node:alpine AS base

RUN mkdir -p /usr/src/app
ENV PORT 10001

WORKDIR /usr/src/app

COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app

RUN npm install

COPY . /usr/src/app

RUN npm run build

EXPOSE $PORT
CMD ["npm", "run", "start:$PORT"]