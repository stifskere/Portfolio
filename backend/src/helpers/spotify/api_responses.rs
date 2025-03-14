use std::fmt::{Display, Formatter, Result as FmtResult};
use serde::{Deserialize, Serialize};

/// This represents a SpotifyApiError, basically
/// a deserialization of a non 200-299 status code
/// response from spotify.
#[derive(Deserialize, Debug)]
pub struct ApiSpotifyError {
    /// Usually the error code.
    error: String,
    /// The error description (sometimes empty string or
    /// sometimes not even there).
    #[serde(rename(deserialize = "error_description"))]
    description: Option<String>
}

/// This struct is part of the Spotify api response
/// it contains the URLS for the social media platforms
/// we actually want, it's separated in a struct for
/// deserialization purposes.
#[derive(Deserialize, Serialize, Debug)]
pub struct ApiSpotifyExternalUrls {
    spotify: Option<String>
}

/// This structure describes a spotify song author,
/// commonly refered as "artist" by the Spotify
/// api itself. This is directly returned by the
/// Spotify api.
#[derive(Deserialize, Debug)]
pub struct ApiSpotifyArtist {
    /// This are the URLS this artist linked
    /// to their Spotify profile.
    #[serde(rename(deserialize = "external_urls"))]
    urls: ApiSpotifyExternalUrls,
    /// This is the artist profile name
    /// from Spotify directly.
    name: String,
}

/// This structure describes an image, in this
/// case it's used for the song thumbnail,
/// this data is returned directly from the
/// Spotify api.
///
/// In this case the height and width are used
/// to get the bigger one, as Spotify returns
/// us a list of thumbnails for different sizes.
#[derive(Deserialize, Debug)]
pub struct ApiSpotifySongImage {
    /// This is used for the height
    /// of the thumbnail.
    height: u16,
    /// This is used for the width
    /// of the thumbmail.
    width: u16,
    /// This is the thumbnail URL directly.
    url: String
}

#[derive(Deserialize, Debug)]
pub struct ApiSpotifySongAlbum {
    images: Vec<ApiSpotifySongImage>
}

#[derive(Deserialize, Debug)]
pub struct ApiSpotifySongItem {
    album: ApiSpotifySongAlbum,

    #[serde(rename(deserialize = "name"))]
    title: String,

    #[serde(rename(deserialize = "external_urls"))]
    urls: ApiSpotifyExternalUrls,

    #[serde(rename(deserialize = "artists"))]
    authors: Vec<ApiSpotifyArtist>,

    #[serde(rename(deserialize = "duration_ms"))]
    total_time: u32
}

/// This structure describes a spotify song from a
/// "currenly playing" query, some of the names
/// being changed for sake of readability.
///
/// The inside fields are not documented, because
/// they are raw spotify data in all cases.
#[derive(Deserialize, Debug)]
pub struct ApiSpotifySong {
    item: ApiSpotifySongItem,

    #[serde(skip_serializing)]
    is_playing: bool,

    #[serde(rename(deserialize = "progress_ms"))]
    played_time: u32,
}

/// This represents a song timestamp,
/// it's meant to indicate how much time
/// from a song has played and the total
/// song time, this way the front end
/// can make syncronize a progress bar
/// for the current song.
#[derive(Clone, Copy, Serialize, Debug)]
pub struct SongTimestamp {
    /// How much time has played
    /// from the current song.
    played_time: u32,

    /// How much time is left
    /// for the current song
    /// to finish.
    total_time: u32
}

#[derive(Serialize, Debug)]
pub struct SpotifyArtist {
    name: String,
    url: Option<String>
}

#[derive(Serialize, Debug)]
pub struct SpotifySong {
    title: String,
    authors: Vec<SpotifyArtist>,

    is_playing: bool,
    timestamp: SongTimestamp,

    song_url: Option<String>,
    thumbnail_url: Option<String>,
}

impl Display for ApiSpotifyError {
    fn fmt(&self, f: &mut Formatter<'_>) -> FmtResult {
        write!(
            f,
            "{} {}",
            self.error,
            self.description
                .clone()
                .unwrap_or("".into())
        )
    }
}

impl Into<SpotifyArtist> for ApiSpotifyArtist {
    fn into(self) -> SpotifyArtist {
        SpotifyArtist {
            name: self.name,
            url: self
                .urls
                .spotify
        }
    }
}

impl Into<SpotifySong> for ApiSpotifySong {
    fn into(self) -> SpotifySong {
        SpotifySong {
            title: self.item.title,
            authors: self.item.authors
                .into_iter()
                .map(|author| author.into())
                .collect(),
            is_playing: self.is_playing,
            timestamp: SongTimestamp {
                played_time: self.played_time,
                total_time: self.item.total_time
            },
            song_url: self.item.urls.spotify,
            thumbnail_url: self.item.album.images
                .into_iter()
                .max_by_key(|image| (image.height, image.width))
                .map(|image| image.url),
        }
    }
}

impl SpotifyArtist {
    pub fn name(&self) -> &str {
    #[allow(unused)]
        &self.name
    }

    #[allow(unused)]
    pub fn url(&self) -> Option<&String> {
        self.url.as_ref()
    }
}

impl SongTimestamp {
    pub fn played_time(&self) -> u32 {
        self.played_time
    }

    pub fn total_time(&self) -> u32 {
        self.total_time
    }
}


impl SpotifySong {
    #[allow(unused)]
    pub fn title(&self) -> &str {
        &self.title
    }

    #[allow(unused)]
    pub fn authors(&self) -> &[SpotifyArtist] {
        &self.authors
    }

    #[allow(unused)]
    pub fn is_playing(&self) -> bool {
        self.is_playing
    }

    #[allow(unused)]
    pub fn timestamp(&self) -> SongTimestamp {
        self.timestamp
    }

    #[allow(unused)]
    pub fn thumbnail_url(&self) -> Option<&String> {
        self.thumbnail_url.as_ref()
    }
}
