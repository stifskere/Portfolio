
# Portfolio

> [!warning]
> This project is **deprecated**, this was a learning experience as my second portfolio and let me learn next.js and related technologies, the end server for which the CD pointed to has refactored and such infrastructure is not supported anymore. `https://memw.es` does no longer point to what's in this repository.
> 
> Keep an eye on my profile for further endeavours, as I now discovered that rust and ecosystem is the language I want to pursue.

This portfolio is made with `NextJs` the main idea for this portfolio was because I saw a topographic-like design for my mouse pad, and I decided to make my portfolio around it.

![img.png](https://d3fa68hw0m2vcc.cloudfront.net/631/309238823.jpeg)

## Building and/or running

This app was made by bootstrapping the create-next-app template, so it contains its development server and build utilities configured for this project specifically.

Use the next dev server to start a local development server in the port 3000

```bash
npm run dev
```

Or you can also run the build tool that's configured to build a static version of this site and place it in the `/out` directory

```bash
npm run build
```

When you build your own version you should change the `.github/workflows` folder, and make your own workflows. Since you don't have my poller API access, you might want to create your own poller or deploy it trough FTP somewhere else.

## Project dependencies

To install all the dependencies simply run.

```bash
npm install
```

When you configure your project dependencies you will need to clone the `.env.example` file and fill it with the required environment variables.

- `API_GITHUB_TOKEN`: This token is used by the GitHub API all around the project, for the rate widget, the repositories widget, and the gists widget.
- `API_SPOTIFY_AUTH`: This token is the general `Spotify` API token, you can get it in your `Spotify` developer profile after creating an app.
- `API_SPOTIFY_REFRESH`: This token is the one you get when creating an `OAuth` flow with your app scopes, you need to simulate as if you were a user trying to use the app, which technically you are.

For the Environment variables here are some useful pages I used to help me obtain the tokens.

- [GitHub Access Token documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens): In this page you can read how to retrieve your `API_GITHUB_TOKEN`.
- (Official `Spotify` API Authorization documentation)[https://developer.spotify.com/documentation/web-api/concepts/authorization]: In this page you can read the "official" authentication documentation, it is good so you can make yourself an idea of what you are working with.
- (Stack overflow response)[https://stackoverflow.com/questions/60659902/how-to-get-oauth-token-from-spotify]: After reading this response I was able to get my `Spotify` tokens, as it explains how it works.

## Spotify polling disclaimer

You may or may not notice that there is a polling system implemented in the site so the `Spotify` widget can work. The implementation is proxied trough the `NextJs` back-end, and made to appeal [this discussion](https://community.spotify.com/t5/Spotify-for-Developers/Access-to-websockets/td-p/4955299). The proxy system ensures only a request every 5 seconds is made, which is within the `Spotify` API rate-limits. Now `Spotify` is only giving web-socket access to million dollar companies like Discord, which most of us are not.
