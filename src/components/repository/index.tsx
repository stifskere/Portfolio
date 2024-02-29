import {ReactElement} from "react";
import {formatDistanceToNow} from "date-fns";
import {If} from "babel-plugin-jsx-control-statements/components";

import {IoStar} from "react-icons/io5";
import {FaCodeCommit} from "react-icons/fa6";

import {GithubRepository} from "@/app/github/github-types";

import Box from "@/components/box";

import "./index.css";

interface RepositoryProps extends Omit<BaseProps<HTMLDivElement>, "onClick"> {
	repository: GithubRepository;
}

export default function Repository({repository, className, ...props}: RepositoryProps): ReactElement {
	function goToRepository(): void {
		open(repository.html_url, "_blank");
	}

	return <Box onClick={goToRepository} className={`repository ${className}`} {...props}>
		<h1>{repository.name}</h1>
		<p>{repository.description}</p>
		<div>
			<div>
				<If condition={(repository.language?.length ?? 0) !== 0}>
					<div className="repository-language">
						<div className="language-circle"/>
						<span>{repository.language}</span>
					</div>
				</If>
				<span>Updated {formatDistanceToNow(new Date(repository.pushed_at))} ago</span>
			</div>
			<div className="repository-counters">
				<div>
					<IoStar />
					{repository.stargazers_count}
				</div>
				<div>
					<FaCodeCommit />
					{repository.commit_count}
				</div>
			</div>
		</div>
	</Box>;
}