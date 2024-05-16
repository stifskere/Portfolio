
declare interface GithubProfile {
	login: string;
	repos_url: string;
	public_repos: number;
	public_gists: number;
	followers: number;
	following: number;
}

declare interface GithubRating {
	username: string;
	contributions: number;
	followers: number;
	stars: number;
	forks: number;
	significantRepos: number;
}

declare interface GithubRatingWithMark extends GithubRating {
	mark: string;
	position: number;
}

declare interface GithubRepositoryFromSource {
	name: string;
	full_name: string;
	description: string;
	html_url: string;
	pushed_at: string;
	archived: boolean;
	stargazers_count: number;
	language?: string;
	url: string;

	fork: boolean;
	forks_count: number;
	parent?: GithubRepositoryFromSource;

	commits_url: string;
	commit_count: number;
}

declare type GithubRepository = Omit<
	GithubRepositoryFromSource,
	"commits_url" |
	"forks_url" |
	"fork_repo" |
	"fork"
>;

declare interface GithubGist {
	html_url: string;
	files: { [key: string]: GithubGistFile }
	public: boolean
	description?: string;
}

interface GithubGistFile {
	filename: string;
	language: string;
	raw_url: string;
}

declare interface GithubCompiledGist {
	filename: string;
	language: string;
	cut_string: string;
	public_url: string;
	description?: string;
	order: number;
}