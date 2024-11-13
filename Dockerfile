FROM node:alpine

ARG ApiGithubToken
ARG ApiSpotifyAuth
ARG ApiSpotifyRefresh

ENV ApiGithubToken=${ApiGithubToken}
ENV ApiSpotifyAuth=${ApiSpotifyAuth}
ENV ApiSpotifyRefresh=${ApiSpotifyRefresh}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN touch /usr/src/app/.env
RUN echo -e "API_GITHUB_TOKEN=\"$ApiGithubToken\" \
    \nAPI_SPOTIFY_AUTH=\"$ApiSpotifyAuth\" \
    \nAPI_SPOTIFY_REFRESH=\"$ApiSpotifyRefresh\"" \
	| cat >> /usr/src/app/.env

RUN npm run build

EXPOSE 10001

CMD ["npm", "run", "start"]
