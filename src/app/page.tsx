"use client";

import {ReactElement, useEffect, useState} from "react";
import Image from "next/image";
import {formatDistanceToNowStrict} from "date-fns";

import {FaDiscord, FaInstagram, FaLinkedin} from "react-icons/fa6";

import Social from "@/components/social";
import Box from "@/components/box";
import PageSelector from "@/components/page-selector";
import Repository from "@/components/repository";
import FooterList from "@/components/footer-list";
import FooterContact from "@/components/footer-contact";
import Gist from "@/components/gist";
import Loader from "@/components/content-loader";
import SpotifyStatus from "@/components/spotify-status";
import GithubRating from "@/components/github-rating";

import logo from "../../public/logo.png";

import "./page.css";

export default function Home(): ReactElement {
	const [repos, setRepos]: StateTuple<GithubRepository[] | undefined | null> = useState();
	const [page, setPage]: StateTuple<number> = useState(0);
	const [gists, setGists]: StateTuple<GithubCompiledGist[] | undefined | null> = useState();
	const [phrase, setPhrase]: StateTuple<ReactElement | undefined> = useState();

	const waitingPhrases: ReactElement[] = [
		<>... It&apos;s not the time <b>YET</b></>,
		<>... It hasn&apos;t arrived <b>YET</b></>,
		<>... It&apos;s not here</>,
		<>... The moment is not <b>NOW</b></>,
		<>... The answer is not <b>HERE</b></>,
		<>... We&apos;re still <b>WAITING</b></>,
		<>... The time hasn&apos;t come</>,
		<>... It&apos;s still being <b>AWAITED</b></>,
		<>... The reveal is <b>PENDING</b></>,
		<>... We are <b>ANTICIPATING</b></>,
		<>... It remains <b>UNSEEN</b></>,
		<>... The moment is <b>COMING</b></>,
		<>... The wait is not <b>OVER</b></>
	];

	useEffect((): void => {
		fetch("/github/repos")
			.then(async (r: Response): Promise<void> => setRepos(
				r.ok
					? (await r.json()).sort((a: GithubRepository, b: GithubRepository): number =>
						new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
					)
					: null
			));

		fetch("/github/gists")
			.then(async (r: Response): Promise<void> => setGists(
				r.ok
					? (await r.json())
					: null
			));

		setPhrase(waitingPhrases[Math.floor(Math.random() * waitingPhrases.length)]);
	}, []);

	function setCurrentPage(page: number): void {
		setPage(page - 1);
	}

	function setPresentationFace(smiling: boolean): (() => void) {
		return (): void => {
			const element: HTMLHeadingElement
				= document.querySelector(".presentation-container-text > h1 > span") as HTMLHeadingElement;

			element.innerText = smiling ? "  :D" : "  ;)";
		};
	}

	return <main>
		<section className="title">
			<div>
				<h1>MEMW</h1>
				<h2>Developer;</h2>
			</div>
		</section>
		<section className="presentation">
			<div>
				<Box className="presentation-container">
					<div className="presentation-container-text">
						<h1>Hello
							<span onMouseEnter={setPresentationFace(true)} onMouseLeave={setPresentationFace(false)}>
								&nbsp;&nbsp;;)
							</span>
						</h1>
						<p>
							{`
							I'm Esteve, a ${formatDistanceToNowStrict(new Date("2005-11-06"))} old developer on a mission to 
							bring ideas to life and craft innovative solutions. Embarking on this journey 
							${formatDistanceToNowStrict(new Date("2021-12-26"))} ago, I've delved into realms of C#, C++, 
							JavaScript, React, Vue, Laravel, 
							and beyond. Eager to embrace fresh challenges and perpetually pursuing knowledge, I stand ready to 
							collaborate and create wonders together. Let's build something extraordinary!
							`}
						</p>
					</div>
					<div className="presentation-interactable">
						<div className="presentation-experience">
							<p>Take a look at</p>
							<p>... Forget it ...</p>
							<p>{phrase ?? "..."}</p>
						</div>
						<div className="presentation-contact">
							<p>Get in touch:</p>
							<div className="presentation-socials">
								<Social
									href="https://discord.gg/pKMhTkRqjQ"
									icon={<FaDiscord/>}
									name="Discord"
								/>
								<Social
									href="https://www.instagram.com/_memw1/"
									icon={<FaInstagram/>}
									name="Instagram"
								/>
								<Social
									href="https://www.linkedin.com/in/esteve-autet-75b796298/"
									icon={<FaLinkedin/>}
									name="LinkedIn"
								/>
							</div>
						</div>
					</div>
				</Box>
				<div className="presentation-boxes">
					<SpotifyStatus/>
					<GithubRating/>
				</div>
			</div>
		</section>
		<section className="projects">
			<div>
				<Loader error={repos === null} waiting={repos === undefined} what="github repositories">
					<>
						<div className="repositories">
							{repos?.slice(page * 3, Math.min((page + 1) * 3, repos!.length))
								.map((repo: GithubRepository, index: number): ReactElement =>
									<Repository repository={repo} key={index}/>
								)}
						</div>
						<PageSelector
							pageSelected={setCurrentPage}
							className="repository-page-selector"
							pages={Math.ceil((repos?.length ?? 0) / 3)}
						/>
					</>
				</Loader>
			</div>
		</section>
		<section className="gists">
			<Loader error={gists === null} waiting={gists === undefined} what="github gists">
				<>
					{gists
						?.toSorted((gistA: GithubCompiledGist, gistB: GithubCompiledGist) => gistA.order - gistB.order)
						.map((gist: GithubCompiledGist, index: number) => <Gist key={index} gist={gist}/>)
					}
				</>
			</Loader>
		</section>
		<footer>
			<div className="footer-content">
				<Image unoptimized src={logo} alt="logo"/>
				<div>
					<FooterContact />
					<FooterList title="About this">
						{[
							{
								content: "Page source",
								href: "https://github.com/stifskere/Portfolio"
							},
							{
								content: "PDF version",
								href: "/resume.pdf"
							}
						]}
					</FooterList>
					<FooterList title="More">
						{[
							{
								content: "MemwLib",
								href: "https://www.nuget.org/packages/MemwLib"
							},
							{
								content: "Coming soon...",
								href: "https://discord.gg/vzgbCJBKHa",
								disabled: true
							}
						]}
					</FooterList>
				</div>
			</div>
		</footer>
	</main>;
}
