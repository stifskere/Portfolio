"use client";

import { ReactElement, useState } from "react";

import "../layout.css";
import "./page.css";

export default function Links(): ReactElement {
	const [counter, setCounter] = useState(0);

	return <>
		This... is not yet implemented,
		you can still increment this counter I guess.
		<br />
		<button onClick={() => setCounter(last => last + 1)}>Increment</button>
		<br />
		<h1>{counter}</h1>
	</>;
}
