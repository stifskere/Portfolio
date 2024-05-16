import {NextResponse} from "next/server";
import {githubRequestInit} from "@/app/github/github-constants";

export const revalidate: number = 3600;

export async function GET(): Promise<NextResponse<GithubRepository[] | null>> {
	const repositoryResponse: Response
		= await fetch("https://api.github.com/users/stifskere/repos?per_page=100&cache_bust=0", githubRequestInit);

	if (!repositoryResponse.ok)
		return new NextResponse(null, { status: 500 });

	const repos: GithubRepositoryFromSource[] = await repositoryResponse.json();

	for (const repository of repos) {
		const repoCommitsResponse: Response
			= await fetch(repository.commits_url.replace("{/sha}", ""), githubRequestInit);

		repository.commit_count = repoCommitsResponse.ok
			? ((await repoCommitsResponse.json()) as unknown[]).length
			: 0;

		if (!repository.fork)
			continue;

		const forkResponse: Response
			= await fetch(repository.url!, githubRequestInit);

		if (forkResponse.ok) {
			const currentRespository: GithubRepositoryFromSource
				= await forkResponse.json() satisfies GithubRepositoryFromSource;

			if (currentRespository.parent !== undefined)
				repository.parent = currentRespository.parent;
		}
	}

	return NextResponse.json(<GithubRepository[] | null>(repos ?? null));
}