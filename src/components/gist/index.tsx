import {ReactElement} from "react";
import {GithubCompiledGist} from "@/app/github/github-types";
import SyntaxHighlighter from "react-syntax-highlighter";
import { stackoverflowDark } from "react-syntax-highlighter/dist/esm/styles/hljs"

import "./index.css";

interface GistProps {
	gist: GithubCompiledGist
}

export default function Gist({gist}: GistProps): ReactElement {

	function onClickGist(): void {
		open(gist.public_url, "_blank")
	}

	return <div className="gist" onClick={onClickGist}>
		<div className="gist-header">
			<div>
				<p>{gist.filename}</p>
				{gist.description && <><p className="gist-desc">{gist.description}</p></>}
			</div>
			<div>
				<div className="language-circle"></div>
				<p>{gist.language}</p>
			</div>
		</div>
		<div className="gist-content">
			<SyntaxHighlighter language={gist.language.toLowerCase()} style={stackoverflowDark}>
				{gist.cut_string}
			</SyntaxHighlighter>
		</div>
	</div>
}