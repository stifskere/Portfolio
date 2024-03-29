import {NextResponse} from "next/server";
import {GithubRepository, GithubRepositoryFromSource} from "@/app/github/github-types";

export const revalidate = 3600;

const githubRequestInit: RequestInit = {
	headers: {
		Accept: "application/vnd.github+json",
		Authorization: `Bearer ${process.env["API_GITHUB_TOKEN"]}`,
		"Cache-Control": "no-cache"
	}
}

export async function GET(): Promise<NextResponse<GithubRepository[] | null>> {
	const repositoryResponse: Response
		= await fetch("https://api.github.com/users/stifskere/repos?per_page=100&cache_bust=0", githubRequestInit);

	if (!repositoryResponse.ok)
		return new NextResponse(null, { status: 500 });

	const repos: GithubRepositoryFromSource[] = await repositoryResponse.json();

	for (const repository of repos) {
		const commitsResponse: Response
			= await fetch(repository.commits_url.replace("{/sha}", ""), githubRequestInit);

		repository.commit_count = commitsResponse.ok
			? ((await commitsResponse.json()) as unknown[]).length
			: 0;

		if (!repository.fork)
			continue;

		const forkResponse: Response
			= await fetch(repository.url!, githubRequestInit);

		if (forkResponse.ok) {
			const currentRespository: GithubRepositoryFromSource
				= (await forkResponse.json() satisfies GithubRepositoryFromSource);

			if (currentRespository.parent !== undefined)
				repository.parent = currentRespository.parent;
		}
	}

	return NextResponse.json(<GithubRepository[] | null>(repos ?? null));
}