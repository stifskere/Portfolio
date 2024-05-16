FROM node:alpine AS base

ARG ApiGithubToken
ENV ApiGithubToken=${ApiGithubToken}
ARG ApiSpotifyAuth
ENV ApiSpotifyAuth=${ApiSpotifyAuth}
ARG ApiSpotifyRefresh
ENV ApiSpotifyRefresh=${ApiSpotifyRefresh}

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app
COPY . /usr/src/app

RUN touch /usr/src/app/.env
RUN echo -e "API_GITHUB_TOKEN=\"$ApiGithubToken\" \
    \nAPI_SPOTIFY_AUTH=\"$ApiSpotifyAuth\" \
    \nAPI_SPOTIFY_REFRESH=\"$ApiSpotifyRefresh\"" | cat >> /usr/src/app/.env

RUN npm install

RUN npm run build

EXPOSE 10001
CMD ["npm", "run", "start"]