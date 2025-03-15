use std::fmt::{Display, Formatter, Result as FmtResult};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug)]
pub struct ApiSpotifyError {
    error: String,

    #[serde(rename(deserialize = "error_description"))]
    description: Option<String>
}

#[derive(Deserialize, Serialize, Debug)]
pub struct ApiSpotifyExternalUrls {
    spotify: Option<String>
}

#[derive(Deserialize, Debug)]
pub struct ApiSpotifyArtist {
    name: String,
    #[serde(rename(deserialize = "external_urls"))]
    urls: ApiSpotifyExternalUrls
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

#[derive(Deserialize, Debug)]
pub struct ApiSpotifySong {
    item: ApiSpotifySongItem,

    #[serde(skip_serializing)]
    is_playing: bool,

    #[serde(rename(deserialize = "progress_ms"))]
    played_time: u32,
}

#[derive(Clone, Copy, Serialize, Debug)]
pub struct SongTimestamp {
    played_time: u32,
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
