import {ReactElement, useEffect, useState} from "react";
import {IoIosSend} from "react-icons/io";
import {format, toZonedTime} from "date-fns-tz";

import "./index.css";

export default function FooterContact(): ReactElement {
	const [second, setSecond]: StateTuple<number> = useState<number>(0);

	useEffect((): (() => void) => {
		const interval: NodeJS.Timeout = setInterval((): void => {
			setSecond((last: number) => last > 60 ? 0 : last + 1);
		}, 1000);
		return (): void => { clearInterval(interval); };
	}, []);

	function readAndRedirect(): void {
		const inputElement: HTMLInputElement
			= document.getElementById("send-whatsapp-input") as HTMLInputElement;

		window.open(`https://wa.me/34611080006?text=${inputElement.value}`, "_blank")
	}

	const formattedTime: string = format(
		toZonedTime(new Date(), "Etc/GMT-2"),
		`hh${second % 2 !== 0 ? ":" : " "}mm a`,
		{ timeZone: "Etc/GMT-2" }
	)

	const timeDifference: number
		= (new Date().getTimezoneOffset() + 120) / 60;

	return <div className="footer-contact">
		<h1>Get in touch</h1>
		<div className="contact-input">
			<input type="text" id="send-whatsapp-input" placeholder="Send a whatsapp..."/>
			<IoIosSend onClick={readAndRedirect}/>
		</div>
		<div className="contact-caption">
			<p>
				My time is <span>GMT+2</span>
				(<span>{formattedTime}</span>{timeDifference != 0
				? `, ${Math.abs(timeDifference)} hours ${timeDifference > 0 ? "ahead" : "behind"}`
				: ""}),
				I&apos;l reply <span>ASAP.</span>
			</p>
		</div>
	</div>;
}