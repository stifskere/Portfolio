
export interface GithubRepositoryFromSource {
	name: string;
	full_name: string;
	description: string;
	html_url: string;
	pushed_at: string;
	archived: boolean;
	stargazers_count: number;
	language?: string;

	fork: boolean;
	forks_url?: string;
	requested_forks?: GithubRepositoryFromSource

	commits_url: string;
	commit_count: number;
}


export type GithubRepository = Omit<
	GithubRepositoryFromSource,
	"commits_url" |
	"forks_url" |
	"requested_forks" |
	"fork"
> & {
	requested_forks?: GithubRepository
};