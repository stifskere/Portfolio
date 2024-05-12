
export const githubRequestInit: RequestInit = {
	headers: {
		Accept: "application/vnd.github+json",
		Authorization: `Bearer ${process.env["API_GITHUB_TOKEN"]}`,
		"Cache-Control": "no-cache"
	}
}