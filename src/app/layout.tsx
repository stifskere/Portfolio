import type {Metadata, Viewport} from "next";
import {ReactNode} from "react";

export const metadata: Metadata = {
	title: "Memw | Developer",
	description: "Memw's Full Stack Developer Portfolio",
	metadataBase: new URL("https://memw.es"),
	openGraph: {
		title: "Memw developer's portfolio",
		type: "website",
		images: "/meta.png",
		description: "Your vision, meticulously crafted into reality. That's my promise."
	}
};

export const viewport: Viewport = {
	themeColor: "#000000"
}

export default function RootLayout({children}: Readonly<WithChildren<ReactNode>>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
