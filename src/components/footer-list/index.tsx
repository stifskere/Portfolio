import {MouseEvent, ReactElement} from "react";

import {FaArrowRight} from "react-icons/fa6";

import "./index.css";

interface Link {
	content: string;
	href: string;
	disabled?: boolean;
}

interface FooterListProps extends Omit<BaseProps<HTMLDivElement>, "children">{
	title: string;
	children: Link[];
}

export default function FooterList({title, children, className, ...props}: FooterListProps): ReactElement {
	function avoidRedirectOnDisabled(event: MouseEvent<HTMLAnchorElement>) {
		if ((event.target as HTMLAnchorElement).dataset.disabled === "true")
			event.preventDefault();
	}

	return <div className={`footer-list ${className ?? ""}`} {...props}>
		<h1>{title}</h1>
		<div>
			{children.map((link: Link, index: number): ReactElement =>
				<a className="footer-link"
				   data-disabled={link.disabled ?? false}
				   href={link.disabled ? "/" : link.href}
				   key={index}
				   target="_blank"
				   onClick={avoidRedirectOnDisabled}
				>
					<FaArrowRight />
					{link.content}
				</a>
			)}
		</div>
	</div>;
}
