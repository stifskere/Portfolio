"use client";

import {ReactElement} from "react";

import {FaGithub, FaInstagram, FaLinkedin} from "react-icons/fa6";

import Social from "@/components/social";
import Box from "@/components/box";

import "./page.css";

export default function Home(): ReactElement {
	return <main>
		<section className="title">
			<div>
				<h1>
					<span>M</span>
					<span>E</span>
					<span>M</span>
					<span>W</span>
				</h1>
				<h2>
					<span>D</span>
					<span>e</span>
					<span>v</span>
					<span>e</span>
					<span>l</span>
					<span>o</span>
					<span>p</span>
					<span>e</span>
					<span>r</span>
					<span>;</span>
				</h2>
			</div>
		</section>
		<section className="presentation">
			<div>
				<Box className="presentation-description">
					Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consequuntur
					doloribus eos, explicabo fugit ipsum quibusdam quidem sapiente sit? Aperiam
					ipsa maiores non sint tenetur. Distinctio et explicabo nam praesentium voluptatem.
				</Box>
				<div className="presentation-socials">
					<Social icon={<FaInstagram />} name="Instagram" />
					<Social icon={<FaGithub />} name="GitHub" />
					<Social icon={<FaLinkedin />} name="LinkedIn" />
				</div>
			</div>
		</section>
		<section className="projects">
			<div>

			</div>
		</section>
	</main>;
}
