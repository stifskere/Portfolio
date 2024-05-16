import {ReactElement, useEffect, useState} from "react";
import {Choose, Otherwise, When} from "babel-plugin-jsx-control-statements/components";

import {CgSpinner} from "react-icons/cg";
import {FaCodeFork, FaStar, FaUser} from "react-icons/fa6";
import {RiGitRepositoryFill} from "react-icons/ri";

import Box from "@/components/box";
import ProgressBar from "@/components/progress-bar";

import "./index.css";

export default function GithubRating(): ReactElement {
	const [rating, setRating]: StateTuple<GithubRatingWithMark | undefined> = useState();

	useEffect((): void => {
		fetch("/github/rating")
			.then(async r => setRating(await r.json()));
	}, []);

	function onClickRating(): void {
		open("https://github.com/stifskere", "_blank")
	}

	return <Choose>
		<When condition={rating === undefined}>
			<Box className="box-loading">
				<CgSpinner className="spin" />
				<p>Loading, please wait...</p>
			</Box>
		</When>
		<Otherwise>
			<Box className="github-rating" onClick={onClickRating}>
				<div className="github-status">
					<h2>{rating!.username}</h2>
					<div className="github-rating-stats">
						<div>
							<p><FaUser/><b>Followers:</b></p>
							<p><FaStar/><b>Total Stars:</b></p>
							<p><FaCodeFork/><b>Forks:</b></p>
							<p><RiGitRepositoryFill/><b>Repositories:</b></p>
						</div>
						<div>
							<p>{rating!.followers}</p>
							<p>{rating!.stars}</p>
							<p>{rating!.forks}</p>
							<p>{rating!.contributions}</p>
						</div>
					</div>
				</div>
				<div className="github-mark">
					<h3>{rating!.mark}</h3>
					<ProgressBar current={rating!.position} total={6}/>
				</div>

			</Box>
		</Otherwise>
	</Choose>;
}