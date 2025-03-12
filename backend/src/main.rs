use actix_web::{main, App, HttpServer};
use actix_web::web::Data;
use dotenvy::dotenv;
use helpers::spotify::poller::{SpotifyAuthorization, SpotifyPoller};
use routes::spotify::spotify_scope;
use thiserror::Error;
use std::env::var;
use std::io::Error as IoError;

mod helpers;
mod routes;

#[derive(Error, Debug)]
enum ApplicationError {
    #[error("Error starting actix web: {0:#}")]
    Io(#[from] IoError)
}

#[main]
async fn main() -> Result<(), ApplicationError> {
    dotenv().ok();

    const MISSING_VAR_ERR: &str = "
Missing a spotify poller environment variable,
without this the SpotifyPoller can't authenticate
to spotify.

The SpotifyPoller is not an optional feature.
    ";

    let spotify_poller = Data::new(
        SpotifyPoller::new(
            SpotifyAuthorization {
                client_id: var("SPOTIFY_CLIENT_ID").expect(MISSING_VAR_ERR),
                refresh_token: var("SPOTIFY_REFRESH_TOKEN").expect(MISSING_VAR_ERR),
                client_secret: var("SPOTIFY_CLIENT_SECRET").expect(MISSING_VAR_ERR)
            }
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
