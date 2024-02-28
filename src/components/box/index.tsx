import {ReactElement} from "react";

import "./index.css";

export default function Box({className = "", ...props}: BaseProps<ReactElement | string>): ReactElement {
	return <div className={`${className} box`} {...props}/>
}