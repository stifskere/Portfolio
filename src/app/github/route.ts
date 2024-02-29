"use server";

import {NextResponse} from "next/server";

import {GithubRepository, GithubRepositoryFromSource} from "@/app/github/github-types";

interface ExpiringRepoCache {
	expiration: Date;
	repos?: GithubRepositoryFromSource[];
}

const githubRequestInit: RequestInit = {
	headers: {
		Accept: "application/vnd.github+json",
		Authorization: `Bearer ${process.env["GITHUB_API_TOKEN"]}`,
		"X-GitHub-Api-Version": "2022-11-28"
	}
}

const repoCache: ExpiringRepoCache = {
	expiration: new Date()
};

export async function GET(): Promise<NextResponse<GithubRepository[] | null>> {
	const currentDate: Date = new Date();

	if (repoCache.expiration.getTime() < currentDate.getTime()
		|| repoCache.repos === undefined) {

		repoCache.expiration = new Date(currentDate.getTime() * 10800000);
		const repositoryResponse: Response
			= await fetch("https://api.github.com/users/stifskere/repos", githubRequestInit);

		if (repositoryResponse.ok) {
			repoCache.repos = await repositoryResponse.json() satisfies GithubRepositoryFromSource[];

			for (const repository of repoCache.repos!) {
				const commitsResponse: Response
					= await fetch(repository.commits_url.replace("{/sha}", ""), githubRequestInit);

				repository.commit_count = commitsResponse.ok
					? ((await commitsResponse.json()) as unknown[]).length
					: 0;
			}
		}
	}

	return NextResponse.json(<GithubRepository[] | null>(repoCache.repos ?? null));
}