"use client";

import {ReactElement, useEffect, useState} from "react";
import {Choose, When, Otherwise} from "babel-plugin-jsx-control-statements/components";

import {FaGithub, FaInstagram, FaLinkedin} from "react-icons/fa6";

import {GithubRepository} from "@/app/github/github-types";

import Social from "@/components/social";
import Box from "@/components/box";
import PageSelector from "@/components/page-selector";
import Repository from "@/components/repository";

import "./page.css";

export default function Home(): ReactElement {
	const [repos, setRepos]: StateTuple<GithubRepository[] | undefined | null> = useState();
	const [page, setPage]: StateTuple<number> = useState(0);

	useEffect((): void => {
		fetch("/github")
			.then(async (r: Response): Promise<void> => setRepos(
				(await r.json()).sort((a: GithubRepository, b: GithubRepository): number =>
					new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
				)
			));
	}, []);

	function setCurrentPage(page: number): void {
		setPage(page - 1);
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
					<p>
						Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur
						doloribus eos, explicabo fugit ipsum quibusdam quidem sapiente sit? Aperiam
						ipsa maiores non sint tenetur. Distinctio et explicabo nam praesentium voluptatem.
					</p>
					<div className="presentation-socials">
						<Social href="https://www.instagram.com/_memw1/" icon={<FaInstagram/>} name="Instagram"/>
						<Social href="https://github.com/stifskere" icon={<FaGithub/>} name="GitHub"/>
						<Social href="https://www.linkedin.com/in/esteve-autet-75b796298/" icon={<FaLinkedin/>} name="LinkedIn"/>
					</div>
				</>
			</Box>
		</section>
		<section className="projects">
			<Choose>
				<When condition={repos !== undefined}>
					<div>
						<div className="repositories">
							{repos!.slice(page * 3, Math.min((page + 1) * 3, repos!.length))
								.map((repo: GithubRepository, index: number): ReactElement =>
									<Repository repository={repo} key={index} />
								)}
						</div>
						<PageSelector pageSelected={setCurrentPage} className="repository-page-selector" pages={Math.ceil(repos!.length / 3)}/>
					</div>
				</When>
				<Otherwise>

				</Otherwise>
			</Choose>
		</section>
	</main>;
}
