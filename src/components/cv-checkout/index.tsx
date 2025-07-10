import { ReactElement } from "react";

import Box from "@/components/box";

import "./index.css";

interface CvCheckoutProps {
	container_id: string;
}

export default function CvCheckout({container_id}: CvCheckoutProps): ReactElement {
	function redirect() {
		location.hash = container_id;
	}

	return <>
		<Box onClick={redirect} className="cv-checkout-button">
			<b>I'm available for hire</b>
			<span>Check out my CV</span>
		</Box>
	</>;
}
