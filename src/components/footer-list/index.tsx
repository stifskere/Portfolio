import {ReactElement} from "react";

import {FaArrowRight} from "react-icons/fa6";

import "./index.css";

interface Link {
	content: string;
	href: string;
}

interface FooterListProps extends Omit<BaseProps<HTMLDivElement>, "children">{
	title: string;
	children: Link[];
}

export default function FooterList({title, children, className, ...props}: FooterListProps): ReactElement {
	return <div className={`footer-list ${className}`} {...props}>
		<h1>{title}</h1>
		<div>
			{children.map((link: Link, index: number): ReactElement =>
				<a className="footer-link" href={link.href} key={index}>
					<FaArrowRight />
					{link.content}
				</a>
			)}
		</div>
	</div>;
}
