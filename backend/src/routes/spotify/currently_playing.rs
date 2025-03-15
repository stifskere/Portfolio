use actix_error_proc::{proof_route, HttpResult};
use actix_web::HttpRequest;
use actix_web::web::{Data, Payload};
use actix_web::rt::spawn;
use actix_ws::handle as handle_ws;
use serde_json::to_string as to_json;
use crate::helpers::spotify::poller::{SpotifyPoller, SpotifyPollerError};

#[proof_route(get("/currently-playing"))]
async fn currently_playing(req: HttpRequest, stream: Payload, poller: Data<SpotifyPoller>) -> HttpResult<SpotifyPollerError> {
    let (res, mut session, _stream) = handle_ws(&req, stream)
        .map_err(|err| SpotifyPollerError::Ws(format!("{err:#}")))?;

    session.text(to_json(&poller.sync().await)?).await.ok();

    let mut receiver = poller
        .clone()
        .get_receiver()
        .await
        .map_err(|err| SpotifyPollerError::Subscription(err.to_string()))?;

    spawn(async move {
        loop {
            let event = receiver.recv().await;

            if let Ok(event) = event {
                if let Ok(event) = to_json(&event) {
                    if let Err(_) = session.text(event).await {
                        break;
                    }
                }
            }
        }
    });

    Ok(res)
}
