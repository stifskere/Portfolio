"use client";

import {ReactElement, useEffect, useState} from "react";
import {Choose, When, Otherwise} from "babel-plugin-jsx-control-statements/components";
import Image from "next/image";
import {formatDistanceToNowStrict} from "date-fns";

import {FaGithub, FaInstagram, FaLinkedin} from "react-icons/fa6";
import {CgSpinner} from "react-icons/cg";

import {GithubRepository} from "@/app/github/github-types";

import Social from "@/components/social";
import Box from "@/components/box";
import PageSelector from "@/components/page-selector";
import Repository from "@/components/repository";
import FooterList from "@/components/footer-list";

import logo from "../../public/logo.png";

import "./page.css";


export default function Home(): ReactElement {
	const [repos, setRepos]: StateTuple<GithubRepository[] | undefined | null> = useState();
	const [page, setPage]: StateTuple<number> = useState(0);

	useEffect((): void => {
		fetch("/github")
			.then(async (r: Response): Promise<void> => setRepos(
				r.ok
					? (await r.json()).sort((a: GithubRepository, b: GithubRepository): number =>
						new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
					)
					: null
			));
	}, []);

	function setCurrentPage(page: number): void {
		setPage(page - 1);
	}

	function setPresentationFace(smiling: boolean): (() => void) {
		return (): void => {
			const element: HTMLHeadingElement
				= document.querySelector(".presentation-container > h1 > span") as HTMLHeadingElement;


			element.innerText = smiling ? ":D" : ";)";
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
			<Box className="presentation-container">
				<>
					<h1>Hello <span onMouseEnter={setPresentationFace(true)} onMouseLeave={setPresentationFace(false)}>;)</span></h1>
					<p>
						{`
							I'm Esteve, a ${formatDistanceToNowStrict(new Date("2005-11-06"))} old developer on a mission to 
							bring ideas to life and craft innovative solutions. Embarking on this journey 
							${formatDistanceToNowStrict(new Date("2021-12-26"))} ago, I've delved into realms of C#, C++, JavaScript, React, Vue, Laravel, 
							and beyond. Eager to embrace fresh challenges and perpetually pursuing knowledge, I stand ready to 
							collaborate and create wonders together. Let's build something extraordinary!
						`}
					</p>
					<div className="presentation-socials">
						<Social href="https://www.instagram.com/_memw1/" icon={<FaInstagram/>} name="Instagram"/>
						<Social href="https://github.com/stifskere" icon={<FaGithub/>} name="GitHub"/>
						<Social href="https://www.linkedin.com/in/esteve-autet-75b796298/" icon={<FaLinkedin/>} name="LinkedIn"/>
					</div>
				</>
			</Box>
		</section>
		<section className="projects" data-did-error={repos === null} data-loading={repos === undefined}>
			<div>
				<Choose>
					<When condition={repos === null}>
						<Box className="no-repositories-info">
							<h1>Whoops!</h1>
							<p>
								Looks like there was an error while loading the repositories,
								try reloading or wait for this bug to be fixed.
							</p>
						</Box>
					</When>
					<When condition={repos === undefined}>
						<Box className="no-repositories-info">
							<CgSpinner className="spin" />
							<p>Loading, please wait...</p>
						</Box>
					</When>
					<Otherwise>
						<div className="repositories">
							{repos!.slice(page * 3, Math.min((page + 1) * 3, repos!.length))
								.map((repo: GithubRepository, index: number): ReactElement =>
									<Repository repository={repo} key={index}/>
								)}
						</div>
						<PageSelector
							pageSelected={setCurrentPage}
							className="repository-page-selector"
							pages={Math.ceil(repos!.length / 3)}
						/>
					</Otherwise>
				</Choose>
			</div>
		</section>
		<footer>
			<div className="footer-content">
				<Image unoptimized src={logo} alt="logo"/>
				<div>
					<FooterList title="Find me">
						{[
							{
								content: "Email me",
								href: "mailto:contact@memw.es"
							}
						]}
					</FooterList>
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
