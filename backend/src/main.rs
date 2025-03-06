use actix_web::{main, web::Data, App, HttpServer};
use helpers::spotify::poller::{SpotifyAuthorization, SpotifyPoller};
use routes::spotify::spotify_scope;
use thiserror::Error;
use std::{env::var, io::Error as IoError};

mod helpers;
mod routes;

#[derive(Error, Debug)]
enum ApplicationError {
    #[error("Error starting actix web: {0:#}")]
    Io(#[from] IoError)
}

#[main]
async fn main() -> Result<(), ApplicationError> {
    const MISSING_VAR_ERR: &str = "
        Missing a spotify poller environment variable,
        without this the SpotifyPoller can't authenticate
        to spotify.

        The SpotifyPoller is not an optional feature.
    ";

    HttpServer::new(|| {
        let spotify_poller = Data::new(
            SpotifyPoller::new(SpotifyAuthorization {
                client_id: var("SPOTIFY_CLIENT_ID").expect(MISSING_VAR_ERR),
                refresh_token: var("SPOTIFY_REFRESH_TOKEN").expect(MISSING_VAR_ERR)
            })
        );

        App::new()
            .app_data(spotify_poller)
            .service(spotify_scope())
    })
        .bind(("127.0.0.1", 3001))?
        .run()
        .await?;

    Ok(())
}
