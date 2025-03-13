import * as querystring from "node:querystring";

export class SpotifyPoller {
	private static m_token: SpotifyLocalToken | undefined;
	private static m_song: SpotifyLocalSong | undefined;

	private static getDateForExpiration(seconds: number): Date {
		const currentDate = new Date();
		currentDate.setSeconds(currentDate.getSeconds() + seconds);
		return currentDate;
	}

	private static async getToken(): Promise<string> {
		if (this.m_token !== undefined && this.m_token.expires_in.getTime() >= new Date().getTime())
			return this.m_token.access_token;

		const apiToken: Response = await fetch(`https://accounts.spotify.com/api/token`, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Authorization": `Basic ${process.env.API_SPOTIFY_AUTH}`,
				"Cache-Control": "no-cache"
			},
			body: querystring.stringify({
				grant_type: "refresh_token",
				refresh_token: process.env.API_SPOTIFY_REFRESH
			})
		});

		const apiTokenBody: SpotifyAPIToken = await apiToken.json();

		this.m_token = {
			access_token: apiTokenBody.access_token,
			expires_in: this.getDateForExpiration(apiTokenBody.expires_in)
		} satisfies SpotifyLocalToken;

		return this.m_token.access_token;
	}

	public static async getCurrentlyPlaying(): Promise<SpotifySong> {
		if (this.m_song !== undefined && this.m_song.expires_in.getTime() >= new Date().getTime())
			return this.m_song;

		const currentlyPlaying: Response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
			headers: {
				"Authorization": `Bearer ${(await this.getToken())}`,
				"Cache-Control": "no-cache"
			}
		});

		// I'm lazy to specify the type of this horribly made api response.
		const song: any = await currentlyPlaying.json();

		this.m_song = {
			album_image_url: song.item.album.images[0].url,
			artist: song.item.artists.map((artist: any) => ({
				name: artist.name,
				url: artist.external_urls.spotify
			})),
			is_playing: song.is_playing,
			song_url: song.item.external_urls.spotify,
			title: song.item.name,
			time_played: song.progress_ms,
			time_total: song.item.duration_ms,
			artist_url: song.item.album.artists[0].external_urls.spotify,
			expires_in: this.getDateForExpiration(3)
		}

		return <SpotifySong>this.m_song;
	}
}
