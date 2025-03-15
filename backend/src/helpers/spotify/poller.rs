use std::time::{Duration, SystemTimeError};
use std::sync::Arc;
use actix_error_proc::ActixError;
use base64::prelude::BASE64_URL_SAFE;
use base64::Engine;
use serde::{Deserialize, Serialize, Serializer};
use serde::ser::SerializeStruct;
use thiserror::Error;
use tokio::spawn;
use tokio::time::sleep;
use tokio::sync::Mutex;
use tokio::sync::broadcast::{channel, Receiver, Sender};
use crate::helpers::misc::expirable_object::{Expirable, ExpirableObject};
use crate::helpers::misc::functions::in_range;
use reqwest::{Client as HttpClient, Error as ReqwestError, StatusCode};
use reqwest::header::{AUTHORIZATION, CONTENT_TYPE};
use serde_json::Error as JsonError;
use super::api_responses::{ApiSpotifyError, ApiSpotifySong, SongTimestamp, SpotifySong};


const POLLING_RATE_SECS: i32 = 5;

#[derive(ActixError, Error, Debug)]
pub enum SpotifyPollerError {
    #[error("HTTP Request error: {0:#}")]
    Reqwest(#[from] ReqwestError),

    #[error("Spotify API abnormal response found {0:#}.")]
    Api(ApiSpotifyError),

    #[error("Time calculation error: \"{0:#}\".")]
    Time(#[from] SystemTimeError),

    #[error("A WebSocket error occurred: {0}")]
    Ws(String),

    #[error("A Serialization error occurred: {0:#}")]
    Json(#[from] JsonError),

    #[error("An error occurred while subscribing to the poller: {0}")]
    #[http_status(NotAcceptable)]
    Subscription(String)
}

#[derive(Clone, Debug)]
pub enum SpotifyEvent {
    SongPaused(SongTimestamp),

    SongUnpaused(SongTimestamp),

    TimstampChanged(SongTimestamp),

    NewSong(Arc<SpotifySong>),

    ClientDisconnected,

    PollerError(Arc<String>)
}

pub struct SpotifyAuthorization {
    pub refresh_token: String,

    pub client_id: String,

    pub client_secret: String
}

#[derive(Debug)]
pub enum PollerStatus {
    Fresh,

    Working(Receiver<SpotifyEvent>),

    Errored(Arc<String>)
}

pub struct SpotifyPoller {
    access_token: Arc<Mutex<Expirable<String>>>,

    refresh_token: Arc<Mutex<String>>,

    current_song: Arc<Mutex<Option<Arc<SpotifySong>>>>,

    client_id: Arc<String>,

    client_secret: Arc<String>,

    http_client: Arc<HttpClient>,

    poller_status: Arc<Mutex<PollerStatus>>,
}

impl SpotifyPoller {
    pub fn new(auth: SpotifyAuthorization) -> Self {
        Self {
            access_token: Arc::new(Mutex::new(Expirable::new_expired())),
            current_song: Arc::new(Mutex::new(None)),
            refresh_token: Arc::new(Mutex::new(auth.refresh_token)),
            client_id: Arc::new(auth.client_id),
            client_secret: Arc::new(auth.client_secret),
            http_client: Arc::new(HttpClient::new()),
            poller_status: Arc::new(Mutex::new(PollerStatus::Fresh))
        }
    }

    fn basic_auth(&self) -> String {
        format!(
            "Basic {}",
            BASE64_URL_SAFE
                .encode(
                    format!("{}:{}", self.client_id, self.client_secret)
                )
        )
    }

    async fn get_token(&self) -> Result<String, SpotifyPollerError> {
        let mut access_token = self.access_token.lock().await;

        if let ExpirableObject::OnTime(access_token) = access_token.get()? {
            return Ok(access_token.to_string());
        }

        #[derive(Deserialize)]
        struct RefreshTokenResponse {
            access_token: String,
            expires_in: u64,
            refresh_token: Option<String>
        }

        let response = self
            .http_client
            .post("https://accounts.spotify.com/api/token")
            .header(CONTENT_TYPE, "application/x-www-form-urlencoded")
            .header(AUTHORIZATION, self.basic_auth())
            .form(&[
                ("grant_type", "refresh_token"),
                ("refresh_token", &self.refresh_token.lock().await),
            ])
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(SpotifyPollerError::Api(
                response
                    .json()
                    .await?
            ));
        }

        let response = response
            .json::<RefreshTokenResponse>()
            .await?;

        *access_token = Expirable::new_relative(
            response.access_token.clone(),
            response.expires_in
        )?;

        if let Some(refresh_token) = response.refresh_token {
            *self.refresh_token.lock().await = refresh_token;
        }

        Ok(response.access_token)
    }

    pub async fn sync(&self) -> SpotifyEvent {
        match self.current_song.lock().await.as_ref() {
            Some(song) => SpotifyEvent::NewSong(song.clone()),

            None => SpotifyEvent::ClientDisconnected
        }
    }

    async fn get_current_song(&self) -> Result<Option<SpotifySong>, SpotifyPollerError> {
        let token = self.get_token().await?;

        let response = self
            .http_client
            .get("https://api.spotify.com/v1/me/player/currently-playing")
            .header(AUTHORIZATION, format!("Bearer {token}"))
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(SpotifyPollerError::Api(
                response
                    .json()
                    .await?
            ));
        }

        if response.status() == StatusCode::NO_CONTENT {
            return Ok(None);
        }

        let response_body = response
            .json::<ApiSpotifySong>()
            .await?
            .into();

        Ok(Some(response_body))
    }

    async fn poller_task(_self: Arc<Self>, sender: Sender<SpotifyEvent>) {
        loop {
            let new_song = match _self.get_current_song().await {
                Ok(new_song) => new_song.map(|new_song| Arc::new(new_song)),

                Err(err) => {
                    let err_fmt = Arc::new(format!("{err:#}"));

                    sender.send(SpotifyEvent::PollerError(err_fmt.clone())).ok();
                    *_self.poller_status.lock().await = PollerStatus::Errored(err_fmt.clone());

                    break;
                }
            };

            let mut current_song = _self.current_song.lock().await;

            if let Some(event) = SpotifySong::event_from_poll(current_song.clone(), new_song.clone()) {
                sender.send(event).ok();
            }

            *current_song = new_song;

            drop(current_song);

            sleep(Duration::from_secs(POLLING_RATE_SECS as u64)).await;
        }
    }

    pub async fn get_receiver(self: &Arc<Self>) -> Result<Receiver<SpotifyEvent>, Arc<String>> {
        let mut poller_status = self
            .poller_status
            .lock()
            .await;

        match &*poller_status {
            PollerStatus::Errored(error) => Err(error.clone()),

            PollerStatus::Fresh => {
                let (sender, receiver) = channel::<SpotifyEvent>(100);

                spawn(Self::poller_task(self.clone(), sender));

                *poller_status = PollerStatus::Working(receiver.resubscribe());

                Ok(receiver.resubscribe())
            },

            PollerStatus::Working(receiver) => Ok(receiver.resubscribe())
        }
    }
}

impl SpotifySong {
    pub fn event_from_poll(current: Option<Arc<Self>>, other: Option<Arc<Self>>) -> Option<SpotifyEvent> {
        if current.is_none() && other.is_none() {
            return None;
        }

        let Some(other) = other
        else {
            return Some(SpotifyEvent::ClientDisconnected);
        };

        let Some(current) = current
        else {
            return Some(SpotifyEvent::NewSong(other));
        };

        let same_authors = current.authors()
            .iter()
            .all(|c_author| other
                .authors()
                .iter()
                .any(|o_author| c_author.name() == o_author.name())
            )
            && current.authors().len() == other.authors().len();

        if current.title() != other.title() || !same_authors {
            return Some(SpotifyEvent::NewSong(other.clone()))
        }

        if current.is_playing() != other.is_playing() {
            return Some(match other.is_playing() {
                true => SpotifyEvent::SongUnpaused(other.timestamp()),

                false => SpotifyEvent::SongPaused(other.timestamp())
            })
        }

        let c_played_secs = (current.timestamp().played_time() / 1000) as i32;
        let o_played_secs = (other.timestamp().played_time() / 1000) as i32;
        let valid_range = (POLLING_RATE_SECS - 1)..(POLLING_RATE_SECS + 1);

        if (other.is_playing() && !in_range(&(o_played_secs - c_played_secs), valid_range))
        || (!other.is_playing() && o_played_secs != c_played_secs) {
            return Some(SpotifyEvent::TimstampChanged(current.timestamp()))
        }

        None
    }
}

impl Serialize for SpotifyEvent {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        macro_rules! ss {
            ($event:literal, $data:expr) => {{
                let mut s = serializer.serialize_struct("SpotifyEvent", 2)?;
                s.serialize_field("event", $event)?;
                s.serialize_field("data", $data)?;
                s.end()
            }};
        }

        match self {
            Self::SongPaused(timestamp) => ss!("SongPaused", timestamp),

            Self::SongUnpaused(timestamp) => ss!("SongUnpaused", timestamp),

            Self::TimstampChanged(timestamp) => ss!("TimestampChanged", timestamp),

            Self::NewSong(song) => ss!("NewSong", song),

            Self::ClientDisconnected => ss!("ClientDisconnected", &None::<()>),

            Self::PollerError(error) => ss!("PollerError", error)
        }
    }
}
