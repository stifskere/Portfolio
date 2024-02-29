import {ReactElement} from "react";

import "./index.css";

export default function Box({className = "", ...props}: BaseProps<HTMLDivElement>): ReactElement {
	return <div className={`${className} box`} {...props}/>
}