import {MutableRefObject, ReactElement, useRef} from "react";
import {formatDistanceToNow} from "date-fns";
import {If} from "babel-plugin-jsx-control-statements/components";

import {IoStar} from "react-icons/io5";
import {FaCodeCommit, FaCodeFork} from "react-icons/fa6";

import Box from "@/components/box";

import "./index.css";

interface RepositoryProps extends Omit<BaseProps<HTMLDivElement>, "onClick"> {
	repository: GithubRepository;
}

export default function Repository({repository, className, ...props}: RepositoryProps): ReactElement {
	const hoveringFork: MutableRefObject<boolean> = useRef(false);

	function goToRepository(): void {
		if (!hoveringFork.current)
			open(repository.html_url, "_blank");
	}

	return <Box onClick={goToRepository} className={`repository ${className ?? ""}`} {...props}>
		<div className="repository-name">
			<h1>{repository.name}</h1>
			<If condition={repository.parent !== undefined}>
				<div className="repository-fork">
					<FaCodeFork/>
					<p
						onMouseEnter={(): boolean => hoveringFork.current = true}
						onMouseLeave={(): boolean => hoveringFork.current = false}
					>
						Forked from <a href={repository.parent!.html_url} target="_blank">
							{repository.parent!.full_name}
						</a>
					</p>
				</div>
			</If>
		</div>
		<p>{repository.description}</p>
		<div className="repository-data">
			<div>
				<If condition={(repository.language?.length ?? 0) !== 0}>
					<div className="repository-language">
						<div className="language-circle"/>
						<span>{repository.language}</span>
					</div>
				</If>
				<span className="repository-updated-at">
					Updated {formatDistanceToNow(new Date(repository.pushed_at))} ago
				</span>
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