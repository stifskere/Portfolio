
interface WithChildren<OfT> {
	children: OfT;
}

interface BaseProps<TChildren> {
	className?: string;
	id?: string;
	style?: React.CSSProperties;
	children?: TChildren
}

type StateTuple<S> = [S, React.Dispatch<React.SetStateAction<S>>];