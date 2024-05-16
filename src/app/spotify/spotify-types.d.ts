
interface SpotifyAPIToken {
	access_token: string;
	expires_in: number;
}

interface SpotifyLocalToken {
	access_token: string;
	expires_in: Date;
}

interface SpotifySong {
	album_image_url: string;
	artist: SpotifyArtist[];
	is_playing: boolean;
	song_url: string;
	title: string;
	time_played: number;
	time_total: number;
	artist_url: string;
}

interface SpotifyLocalSong extends SpotifySong {
	expires_in: Date;
}

interface SpotifyArtist {
	name: string;
	url: string;
}