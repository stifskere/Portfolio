"use client";

import {ReactElement, useEffect, useState} from "react";
import Image from "next/image";
import {formatDistanceToNowStrict} from "date-fns";

import {FaDiscord, FaLinkedin, FaWhatsapp} from "react-icons/fa6";

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
	const [reposPage, setReposPage]: StateTuple<number> = useState(0);
	const [gists, setGists]: StateTuple<GithubCompiledGist[] | undefined | null> = useState();
	const [gistsPage, setGistsPage]: StateTuple<number> = useState(0);
	const [phrase, setPhrase]: StateTuple<ReactElement | undefined> = useState();
	const [easterEnabled, setEasterEnabled]: StateTuple<boolean> = useState<boolean>(false);

	const waitingPhrases: ReactElement[] = [
		<>... It&apos;s not the time <b>YET</b></>,
		<>... It hasn&apos;t arrived <b>YET</b></>,
		<>... It&apos;s not here</>,
		<>... The moment is not <b>NOW</b></>,
		<>... The answer is not <b>HERE</b></>,
		<>... The time hasn&apos;t come</>,
		<>... It&apos;s still being <b>AWAITED</b></>,
		<>... The reveal is <b>PENDING</b></>,
		<>... It remains <b>UNSEEN</b></>,
		<>... The moment is <b>COMING</b></>,
		<>... The wait is not <b>OVER</b></>
	];

	useEffect((): (() => void) | void => {
		if (easterEnabled)
			return;

		const code: string[] = [
			"ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
			"ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
			"KeyB", "KeyA"
		];
		let codePosition: number = 0;

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

		function listenKonamiSequence(ev: KeyboardEvent): void {
			codePosition = ev.code == code[codePosition] ? codePosition + 1 : 0;

			if (codePosition == code.length) {
				document.documentElement.style.setProperty("--font-family", "Pixelify Sans");
				document.documentElement.style.setProperty("--border-radius", "0");
				document.documentElement.style.setProperty("--background", "url(\"/pixelated-background.png\")");
				(document.getElementById("pixel-audio") as HTMLAudioElement).play().then();

				setEasterEnabled(true);
			}
		}

		document.addEventListener("keydown", listenKonamiSequence);
		return (): void => {
			document.removeEventListener("keydown", listenKonamiSequence);
		};
	}, []);

	function setCurrentReposPage(page: number): void {
		setReposPage(page - 1);
	}

	function setCurrentGistsPage(page: number): void {
		setGistsPage(page - 1);
	}

	function setPresentationFace(smiling: boolean): (() => void) {
		return (): void => {
			const element: HTMLHeadingElement
				= document.querySelector(".presentation-container-text > h1 > span") as HTMLHeadingElement;

			element.innerText = smiling ? "  :D" : "  ;)";
		};
	}

	return <main>
		<audio id="pixel-audio" hidden>
			<source src="/explosion.mp3" type="audio/mp3"/>
		</audio>
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
							I'm Esteve, a ${formatDistanceToNowStrict(new Date("2005-11-06"))} old developer I started
							coding ${formatDistanceToNowStrict(new Date("2017-11-6"))} ago, when I was 12, even tho I
							started my professional journey ${formatDistanceToNowStrict(new Date("2021-12-26"))} ago, 
							I have experience in a lot of things, from low level like compilers, operative systems 
							to web development, desktop apps, and service deployment, I'm usually freelancing now 
							but also open to job offers, I speak english, spanish, catalan and russian, if you'd 
							like to collaborate with me, 
							`}
							<a href="#footer" className="desc-link">get in touch.</a>
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
									href="https://discord.gg/4ng5HgmaMg"
									icon={<FaDiscord/>}
									name="RustLangEs"
								/>
								<Social
									href="https://wa.me/34611080006?text=Hello%20I'd%20like%20to%20collaborate."
									icon={<FaWhatsapp/>}
									name="WhatsApp"
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
							{repos?.slice(reposPage * 3, Math.min((reposPage + 1) * 3, repos!.length))
								.map((repo: GithubRepository, index: number): ReactElement =>
									<Repository repository={repo} key={index}/>
								)}
						</div>
						<PageSelector
							pageSelected={setCurrentReposPage}
							className="global-page-selector"
							pages={Math.ceil((repos?.length ?? 0) / 3)}
						/>
					</>
				</Loader>
			</div>
		</section>
		<section className="gists">
			<Loader error={gists === null} waiting={gists === undefined} what="github gists">
				<>
					{gists?.slice(gistsPage * 2, Math.min((gistsPage + 1) * 2, gists!.length))
						.toSorted((gistA: GithubCompiledGist, gistB: GithubCompiledGist) => gistA.order - gistB.order)
						.map((gist: GithubCompiledGist, index: number) => <Gist key={index} gist={gist}/>)
					}
					<PageSelector
						pageSelected={setCurrentGistsPage}
						className="global-page-selector"
						pages={Math.ceil((gists?.length ?? 0) / 2)}
					/>
				</>
			</Loader>
		</section>
		<footer id="footer">
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
