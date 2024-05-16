import {NextResponse} from "next/server";
import {githubRequestInit} from "@/app/github/github-constants";

export const revalidate: number = 1800

export async function GET(): Promise<NextResponse<GithubRatingWithMark>> {
	const profile: GithubProfile = await fetch(
		"https://api.github.com/users/stifskere",
		githubRequestInit
	).then(r => r.json());

	const repos: GithubRepositoryFromSource[] = await fetch(
		profile.repos_url,
		githubRequestInit
	).then(r => r.json());

	let stars: number = 0,
		forks: number = 0,
		significantRepos: number = 0;

	for (const repo of repos) {
		stars += repo.stargazers_count;
		forks += repo.forks_count;
		if (repo.stargazers_count > 10)
			significantRepos++;
	}

	return NextResponse.json(getMark({
		username: profile.login,
		contributions: profile.public_repos,
		followers: profile.followers,
		stars,
		forks,
		significantRepos,
	}));

	function getMark(data: GithubRating): GithubRatingWithMark {
		let mark: string = 'C-';
		let position: number = 0;

		if (data.contributions > 1000 && data.significantRepos > 5 && data.stars > 500 && data.followers > 500) {
			mark = 'A+';
			position = 6;
		} else if (data.contributions > 500 && data.significantRepos > 3 && data.stars > 200 && data.followers > 200) {
			mark = 'A';
			position = 5;
		} else if (data.contributions > 200 && data.significantRepos > 1 && data.stars > 100 && data.followers > 100) {
			mark = 'B+';
			position = 4;
		} else if (data.contributions > 100 && data.significantRepos > 1 && data.stars > 50 && data.followers > 50) {
			mark = 'B';
			position = 3;
		} else if (data.contributions > 50 && data.stars > 20 && data.followers > 20) {
			mark = 'C+';
			position = 2;
		} else if (data.contributions > 20 && data.stars > 10 && data.followers > 10) {
			mark = 'C';
			position = 1;
		}

		return {
			...data,
			mark,
			position
		};
	}
}