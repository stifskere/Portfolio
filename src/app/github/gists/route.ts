import {NextResponse} from "next/server";
import {githubRequestInit} from "@/app/github/github-constants";

export const revalidate: number = 3600;

const pinnedGists: string[] = ["PortfolioIntroduction.md", "C# Tutorial.cs"];

export async function GET(): Promise<NextResponse<GithubCompiledGist[] | null>> {
	const gistsResponse: Response
		= await fetch("https://api.github.com/gists", githubRequestInit);

	if (!gistsResponse.ok)
		return NextResponse.json(null, { status: 500 });

	const gistsObject: GithubCompiledGist[]
		= (await gistsResponse.json() satisfies Promise<GithubGist[]>)
			.filter((gist: GithubGist): boolean => gist.public)
			.flatMap((gist: GithubGist) => Object.keys(gist.files)
				.map(async (file: string) => {
					let content: string =
						(await (await fetch(gist.files[file].raw_url)).text());

					if (content.length > 500)
						content = content.slice(0, 500) + " // ...";

					const filename: string = gist.files[file].filename;
					const order: number = pinnedGists.findIndex(f => f == filename);

					return {
						filename,
						language: gist.files[file].language,
						cut_string: content,
						public_url: gist.html_url,
						description: gist.description,
						order: order !== -1 ? order : pinnedGists.length
					} satisfies GithubCompiledGist;
				})
			);

	return NextResponse.json<GithubCompiledGist[]>(
		await Promise.all(gistsObject)
	);
}