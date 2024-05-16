import {cloneElement, ReactElement, useState} from "react";

import {FaArrowRight} from "react-icons/fa6";

import Box from "@/components/box";

import "./index.css";

interface SocialProps extends Omit<
	BaseProps<HTMLDivElement>,
	"onMouseEnter" |
	"onMouseLeave" |
	"onClick"> {

	icon: ReactElement;
	name: string;
	href: string;
}

export default function Social({
	icon,
	name,
	href,
	className = "",
	...props
}: SocialProps
): ReactElement {
	const [hovering, setHovering]: StateTuple<boolean> = useState(false);

	function click(): void {
		open(href, "_blank")?.focus();
	}

	return <Box
		onMouseEnter={(): void => setHovering(true)}
		onMouseLeave={(): void => setHovering(false)}
		onClick={click}
		className={`${className} social`}
		{...props}
	>
		{hovering
			? <FaArrowRight className="arrow-in" />
			: cloneElement(icon, {className: "logo-in"})
		}
		<span>{name}</span>
	</Box>
}