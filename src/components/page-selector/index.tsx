import {ReactElement, useState} from "react";
import {FaArrowLeft, FaArrowRight} from "react-icons/fa6";

interface PageSelectorProps extends Omit<BaseProps<unknown>, "children"> {
	pageSelected?: (page: number) => void;
	pages: number;
}

export default function PageSelector({pageSelected, pages, className, ...props}: PageSelectorProps): ReactElement {
	const [current, setCurrent]: StateTuple<number> = useState(0);

	function getArrayAt(index: number): number[] {
		const result: number[] = [];
		const halfLength: number = Math.floor(pages / 2);
		const start: number = Math.max(1, index - halfLength);
		const end: number = Math.min(index + halfLength, start + pages - 1);

		for (let i: number = start; i <= end; i++) {
			result.push(i);
		}

		return result;
	}

	function changeIndex(index: number): (() => void) {
		return (): void => {
			if (pageSelected !== undefined)
				pageSelected(index);

			setCurrent(index);
		}
	}

	return <div className={`${className} page-selector`} {...props}>
		<div>
			<FaArrowLeft/>
		</div>
		{getArrayAt(current).map((index: number): ReactElement =>
			<div key={index} data-selected={(index === current)} className="page-selector-index"
				 onClick={changeIndex(index)}>
				<p>{index}</p>
			</div>
		)}
		<div>
			<FaArrowRight/>
		</div>
	</div>;
}