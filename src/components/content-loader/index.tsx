import {ReactElement} from "react";

import {Choose, Otherwise, When} from "babel-plugin-jsx-control-statements/components";
import {CgSpinner} from "react-icons/cg";

import Box from "@/components/box";

import "./index.css";

interface LoaderProps {
	children: ReactElement;
	what: string;
	error: boolean;
	waiting: boolean;
}

export default function Loader({children, what, error, waiting}: LoaderProps): ReactElement {
	return <>
		<Choose>
			<When condition={error}>
				<Box className="no-content-info error-box">
					<h1>Whoops!</h1>
					<p>
						Looks like there was an error while loading the {what},
						try reloading or wait for this bug to be fixed.
					</p>
				</Box>
			</When>
			<When condition={waiting}>
				<Box className="no-content-info">
					<CgSpinner className="spin" />
					<p>Loading, please wait...</p>
				</Box>
			</When>
			<Otherwise>
				{children}
			</Otherwise>
		</Choose>
	</>
}