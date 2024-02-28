import type { Metadata } from "next";
import {ReactNode} from "react";

export const metadata: Metadata = {
	title: "Memw",
	description: "Memw's portfolio.",
};

export default function RootLayout({children}: Readonly<WithChildren<ReactNode>>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
