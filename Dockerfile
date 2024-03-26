FROM node:alpine AS base

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app

RUN npm install

COPY . /usr/src/app

RUN touch .env
RUN --mount=type=secret,id=API_GITHUB_TOKEN \
    sed -i "s/API_GITHUB_TOKEN=/API_GITHUB_TOKEN=$(cat /run/secrets/API_GITHUB_TOKEN)/" .env

RUN npm run build

EXPOSE 10001
CMD ["npm", "run", "start"]