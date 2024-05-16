import {SpotifyPoller} from "@/app/spotify/spotify-poller";
import {NextResponse} from "next/server";

export async function GET(): Promise<NextResponse<SpotifySong | null>> {
	try {
		return NextResponse.json(await SpotifyPoller.getCurrentlyPlaying());
	} catch {
		return NextResponse.json(null);
	}
}