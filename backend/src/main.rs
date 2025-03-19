use actix_web::{main, App, HttpServer};
use actix_web::web::Data;
use dotenvy::dotenv;
use helpers::spotify::poller::{SpotifyAuthorization, SpotifyPoller, SpotifyPollerError};
use routes::spotify::spotify_scope;
use thiserror::Error;
use std::io::Error as IoError;

mod helpers;
mod routes;

#[derive(Error, Debug)]
enum ApplicationError {
    #[error("Error starting actix web: {0:#}")]
    Io(#[from] IoError),

    #[error("Spotify error: {0:#}")]
    Spotify(#[from] SpotifyPollerError)
}

#[main]
async fn main() -> Result<(), ApplicationError> {
    dotenv().ok();

    let spotify_poller = Data::new(
        SpotifyPoller::new(
            SpotifyAuthorization::from_env("SPOTIFY_")?
        )
    );

    HttpServer::new(move || {
        App::new()
            .app_data(Data::clone(&spotify_poller))
            .service(spotify_scope())
    })
        .bind(("127.0.0.1", 3001))?
        .run()
        .await?;

    Ok(())
}
