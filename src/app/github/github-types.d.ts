
export interface GithubRepositoryFromSource {
	name: string;
	description: string;
	html_url: string;
	pushed_at: string;
	archived: boolean;
	stargazers_count: number;
	language?: string;
	fork: boolean;

	commits_url: string;

	commit_count: number;
}


export type GithubRepository = Omit<GithubRepositoryFromSource, "commits_url">;