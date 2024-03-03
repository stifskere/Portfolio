"use server";

import {NextResponse} from "next/server";

import {GithubRepository, GithubRepositoryFromSource} from "@/app/github/github-types";
import {LiaObjectGroup} from "react-icons/lia";

interface ExpiringRepoCache {
	expiration: Date;
	repos?: GithubRepositoryFromSource[];
}

const githubRequestInit: RequestInit = {
	headers: {
		Accept: "application/vnd.github+json",
		Authorization: `Bearer ${process.env["API_GITHUB_TOKEN"]}`,
		"Cache-Control": "no-cache",
		"If-Modified-Since": "Thu, 25 Oct 2012 15:16:27 GMT"
	}
}

const repoCache: ExpiringRepoCache = {
	expiration: new Date()
};

export async function GET(): Promise<NextResponse<GithubRepository[] | null>> {
	const currentDate: Date = new Date();

	if (repoCache.expiration.getTime() < currentDate.getTime()
		|| repoCache.repos === undefined) {

		// I've got to change this some time.
		repoCache.expiration = new Date(currentDate.getTime() * 10800000);
		const repositoryResponse: Response
			= await fetch("https://api.github.com/users/stifskere/repos?per_page=100&cache_bust=0", githubRequestInit);

		if (!repositoryResponse.ok)
			return new NextResponse(null, { status: 500 })

		repoCache.repos = await repositoryResponse.json() satisfies GithubRepositoryFromSource[];

		for (const repository of repoCache.repos!) {
			const commitsResponse: Response
				= await fetch(repository.commits_url.replace("{/sha}", "") + "?cache_bust=0", githubRequestInit);

			repository.commit_count = commitsResponse.ok
				? ((await commitsResponse.json()) as unknown[]).length
				: 0;

			if (!repository.fork)
				continue;

			const forkResponse: Response
				= await fetch(repository.forks_url! + "?cache_bust=0", githubRequestInit)

			if (forkResponse.ok) {
				const forkArray: GithubRepositoryFromSource[]
					= (await forkResponse.json() satisfies GithubRepositoryFromSource[]);

				if (forkArray.length > 0)
					repository.requested_forks = forkArray[0];
			}
		}
	}

	return NextResponse.json(<GithubRepository[] | null>(repoCache.repos ?? null));
}