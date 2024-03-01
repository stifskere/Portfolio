
interface WithChildren<OfT> {
	children: OfT;
}

type BaseProps<TChildren> = React.DetailedHTMLProps<React.HTMLAttributes<TChildren>, TChildren>;

type StateTuple<S> = [S, React.Dispatch<React.SetStateAction<S>>];

declare module "*.pdf";