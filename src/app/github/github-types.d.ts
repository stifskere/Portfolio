
export interface GithubRepositoryFromSource {
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
	parent?: GithubRepositoryFromSource;

	commits_url: string;
	commit_count: number;
}

export type GithubRepository = Omit<
	GithubRepositoryFromSource,
	"commits_url" |
	"forks_url" |
	"fork_repo" |
	"fork"
>;

export interface GithubGist {
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

export interface GithubCompiledGist {
	filename: string;
	language: string;
	cut_string: string;
	public_url: string;
	description?: string;
	order: number;
}