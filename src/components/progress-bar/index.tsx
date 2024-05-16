import {ReactElement} from "react";

import "./index.css";

interface ProgressBarProps {
	current: number;
	total: number;
	className?: string;
}

export default function ProgressBar({current, total, className}: ProgressBarProps): ReactElement {
	return <div className={`progress-bar ${className === undefined ? "" : className}`}>
		<div style={{width: ((100 * current) / total).toString() + "%"}}/>
	</div>;
}