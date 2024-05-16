import {MutableRefObject, ReactElement, useEffect, useRef, useState} from "react";
import {Choose, Otherwise, When} from "babel-plugin-jsx-control-statements/components";
import Image from "next/image";

import {CgSpinner} from "react-icons/cg";
import {FaSpotify} from "react-icons/fa6";

import noSong from "../../../public/no-song.png";

import Box from "@/components/box";
import ProgressBar from "../progress-bar";

import "./index.css";

console.log(`
That pretty Spotify component you see does API polling, since
our dear Spotify doesn't allow us to connect to a websocket
to see real-time changes we have to use other "wrong" ways
to do it.

This is a call to Spotify to make a websocket server
available to all of us (third-party API users).

https://community.spotify.com/t5/Spotify-for-Developers/Access-to-websockets/td-p/4955299

This uses prediction to avoid making a request every second, it syncs actions
within a max window of 5 seconds.

`);

export default function SpotifyStatus(): ReactElement {
	const [current, setCurrent]: StateTuple<SpotifySong | undefined | null> = useState();
	const [ms, setMs]: StateTuple<number | undefined> = useState();
	const hovering: MutableRefObject<boolean> = useRef(false);

	useEffect((): (() => void) => {
		let lastData: SpotifySong | undefined;
		let msInterval: NodeJS.Timeout | undefined;
		let lastUpdateTimestamp: number | undefined;

		const interval: NodeJS.Timeout = setInterval(async (): Promise<void> => {
			const data: SpotifySong = await fetch("/spotify", {
				headers: {
					"Cache-Control": "no-cache"
				}
			}).then(res => res.json());

			if (
				lastData !== undefined
				&& lastData !== null
				&& data !== null
				&& lastData.is_playing === data?.is_playing
				&& lastData.song_url === data?.song_url
				&& lastData.time_played === ms! + (lastUpdateTimestamp ? Date.now() - lastUpdateTimestamp : 0)
			) {
				return;
			}

			if (data !== null)
				setMs(data!.time_played);

			setCurrent(lastData = data);
			lastUpdateTimestamp = Date.now();
		}, 5000);

		msInterval = setInterval(() => {
			if (
				lastData !== null
				&& lastData !== undefined
				&& !lastData.is_playing
				&& lastData.time_played >= lastData.time_total
			)
				return;

			setMs(ms => ms! + 500);
		}, 500);

		return (): void => {
			clearInterval(interval);
			clearInterval(msInterval);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const millisecondsToMMSS = (m: number) => new Date(m)
		.toISOString()
		.substring(14, 19);

	function onClickSong(): void {
		if (!hovering.current)
			open(current!.song_url, "_blank")
	}

	return <>
		<Choose>
			<When condition={current === undefined}>
				<Box className="box-loading">
					<CgSpinner className="spin" />
					<p>Syncing, please wait...</p>
				</Box>
			</When>
			<When condition={current === null}>
				<Box className="spotify-box-song">
					<div>
						<Image src={noSong} alt="no song" unoptimized />
					</div>
					<FaSpotify className="logo-spotify" />
					<div>
						<h2 className="song-title">No song playing</h2>
						<div>
							<ProgressBar current={0} total={1} />
							<div className="spotify-box-controls">
								<p className="spotify-song-authors">-</p>
								<p className="song-time">--:-- / --:--</p>
							</div>
						</div>
					</div>
				</Box>
			</When>
			<Otherwise>
				<Box className="spotify-box-song spotify-clickable" onClick={onClickSong}>
					<div>
						<Image fill src={current!.album_image_url} alt="no song" unoptimized />
					</div>
					<FaSpotify className="logo-spotify" />
					<div>
						<h2 className="song-title">{current!.title}</h2>
						<div>
							<ProgressBar current={ms!} total={current!.time_total} />
							<div className="spotify-box-controls">
								<div
									className="spotify-song-authors"
									onMouseEnter={() => hovering.current = true}
									onMouseLeave={() => hovering.current = false}
								>
									{current!.artist.map((artist: SpotifyArtist, index: number) =>
										<a
											key={index}
											className="spotify-song-artist"
											target="_blank"
										   	href={artist.url}
										>
											{artist.name}{index + 1 === current!.artist.length ? "" : ", "}
										</a>
									)}
								</div>
								<p className="song-time">
									{millisecondsToMMSS(ms!)} / {millisecondsToMMSS(current!.time_total)}
								</p>
							</div>
						</div>
					</div>
				</Box>
			</Otherwise>
		</Choose>
	</>;
}