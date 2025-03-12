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

#[derive(Deserialize, Serialize, Debug)]
pub struct ApiSpotifyExternalUrls {
    spotify: Option<String>
}

/// This structure describes a spotify song author,
/// commonly refered as "artist" by the spotify
/// API itself.
///
/// The inside fields are not documented, because
/// they are raw spotify data in all cases.
#[derive(Deserialize, Debug)]
pub struct ApiSpotifyArtist {
    #[serde(rename(deserialize = "external_urls"))]
    urls: ApiSpotifyExternalUrls,
    name: String,
}

#[derive(Deserialize, Debug)]
pub struct ApiSpotifySongImage {
    height: u16,
    width: u16,
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
            } ,
            thumbnail_url: self.item.album.images
                .into_iter()
                .max_by_key(|image| (image.height, image.width))
                .map(|image| image.url),
        }
    }
}

impl SongTimestamp {
    /// returns a new instance of SongTimeStamp
    /// at 0:0.
    pub fn zero() -> Self {
        Self {
            played_time: 0,
            total_time: 0
        }
    }
}

impl SpotifyArtist {
    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn url(&self) -> Option<&String> {
        self.url.as_ref()
    }
}

/// This is implemented to compare
/// artist equality, to be used
/// in the event_from_poll method
/// of the SpotifySong struct.
impl PartialEq for SpotifyArtist {
    fn eq(&self, other: &Self) -> bool {
        self.name == other.name
    }
}


impl SpotifySong {
    pub fn title(&self) -> &str {
        &self.title
    }

    pub fn authors(&self) -> &[SpotifyArtist] {
        &self.authors
    }

    pub fn is_playing(&self) -> bool {
        self.is_playing
    }

    pub fn timestamp(&self) -> SongTimestamp {
        self.timestamp
    }

    pub fn thumbnail_url(&self) -> Option<&String> {
        self.thumbnail_url.as_ref()
    }
}
