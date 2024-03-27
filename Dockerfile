FROM node:alpine AS base

ARG ApiGithubToken
ENV ApiGithubToken=${ApiGithubToken}

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app
COPY . /usr/src/app

RUN touch /usr/src/app/.env
RUN echo "API_GITHUB_TOKEN=\"$ApiGithubToken\"" | cat >> /usr/src/app/.env

RUN npm install

RUN npm run build

EXPOSE 10001
CMD ["npm", "run", "start"]