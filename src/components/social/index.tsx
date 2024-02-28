import {ReactElement} from "react";

import Box from "@/components/box";

import "./index.css";

interface SocialProps extends BaseProps<ReactElement> {
	icon: ReactElement;
	name: string;
}

export default function Social({icon, name, className, ...props}: SocialProps): ReactElement {
	return <Box className="social" {...props}>
		<>
			{icon}
			<span>{name}</span>
		</>
	</Box>
}