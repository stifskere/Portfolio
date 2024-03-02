import type {Metadata, Viewport} from "next";
import {ReactNode} from "react";

export const metadata: Metadata = {
	title: "Memw | Developer",
	description: "Memw's portfolio.",
	metadataBase: new URL("https://memw.es"),
	openGraph: {
		title: "Memw developer's portfolio",
		type: "website",
		url: "https://memw.es",
		images: "/background.png",
		description: "Discover how can I help you in your projects!"
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
