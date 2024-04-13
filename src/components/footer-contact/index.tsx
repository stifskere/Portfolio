import {ReactElement} from "react";
import {IoIosSend} from "react-icons/io";

import "./index.css";

export default function FooterContact(): ReactElement {
	return <div className="footer-contact">
		<h1>Get in touch</h1>
		<div className="contact-input">
			<input disabled={true} type="email" placeholder="My email is unavailable..."/>
			<IoIosSend/>
		</div>
		<div className="contact-alternative">
			<p>But you can WhatsApp at <a href="https://wa.me/message/L7BNFIDQU44CN1">(+34) 611 080 006</a>.</p>
		</div>
	</div>;
}