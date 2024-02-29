"use client";

import {ReactElement} from "react";

import {FaGithub, FaInstagram, FaLinkedin} from "react-icons/fa6";

import Social from "@/components/social";
import Box from "@/components/box";
import PageSelector from "@/components/page-selector";

import "./page.css";

export default function Home(): ReactElement {
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
			<div>
				<PageSelector className="repository-page-selector" pages={50} />
			</div>
		</section>
	</main>;
}
