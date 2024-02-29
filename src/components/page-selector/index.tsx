import {ReactElement, useEffect, useState} from "react";

import {FaArrowLeft, FaArrowRight} from "react-icons/fa6";

import "./index.css";

interface PageSelectorProps extends BaseProps<HTMLDivElement> {
	pageSelected?: (page: number) => void;
	pages: number;
}

export default function PageSelector({pageSelected, pages, className, ...props}: PageSelectorProps): ReactElement {
	const [current, setCurrent]: StateTuple<number> = useState(1);

	useEffect((): void => {
		if (pages < 0)
			throw new Error("pages can't be less than 0.");
	})

	function getArrayAt(index: number): number[] {
		const result: number[] = [];
		let start: number;

		if (pages < 5 || index <= 3) {
			start = 1;
		} else if (index >= pages - 2) {
			start = pages - 5 + 1;
		} else {
			start = index - 2;
		}

		const end: number = Math.min(start + 5 - 1, pages);

		for (let i: number = start; i <= end; i++)
			result.push(i);

		return result;
	}

	function changeIndex(index: number): (() => void) {
		return (): void => {
			if (pageSelected !== undefined)
				pageSelected(index);

			setCurrent(index);
		};
	}

	function changeIndexBy(diff: number): (() => void) {
		return (): void => {
			const result: number = current + diff;

			if (result >= 1 && result <= pages)
				setCurrent(result);
		};
	}

	return <div className={`${className} page-selector`} {...props}>
		<div onClick={changeIndexBy(-1)} className="page-selector-arrow page-selector-index">
			<FaArrowLeft/>
		</div>
		{getArrayAt(current).map((index: number): ReactElement =>
			<div key={index} data-selected={(index === current)} className="page-selector-index"
				 onClick={changeIndex(index)}>
				<p>{index}</p>
			</div>
		)}
		<div onClick={changeIndexBy(1)} className="page-selector-arrow page-selector-index">
			<FaArrowRight/>
		</div>
	</div>;
}