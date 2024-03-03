
# Portfolio

This portfolio is made with NEXT.JS the main idea for this portfolio was because I saw a topographic-like design for my mouse pad, and I decided to make a website around it.

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

## Project dependencies

To install all the dependencies explained below simply run

```bash
npm install
```

These dependencies are included in the `package.json`

```json
{
	"dependencies": {
		"date-fns": "^3.3.1", // format and convert dates
		"next": "14.1.0",
		"react": "^18",
		"react-dom": "^18",
		"react-icons": "^5.0.1", // all the icons used in this project
		"sharp": "^0.33.2" // next.js image optimization
	},
	"devDependencies": {
		"@types/node": "^20",
		"@types/react": "^18",
		"@types/react-dom": "^18",
		"babel-plugin-jsx-control-statements": "^4.1.2", // add <If> and similar blocks
		"eslint": "^8", // format the code
		"eslint-config-next": "14.1.0",
		"typescript": "^5"
	}
}
```