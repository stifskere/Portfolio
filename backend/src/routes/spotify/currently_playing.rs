use std::sync::Arc;
use actix_error_proc::{proof_route, HttpResult};
use actix_web::{rt::spawn, web::{Data, Payload}, HttpRequest};
use serde_json::to_string as to_json;
use crate::helpers::spotify::poller::{SpotifyPoller, SpotifyPollerError};
use actix_ws::handle as handle_ws;

#[proof_route(get("/spotify/currently-playing"))]
async fn currently_playing(req: HttpRequest, stream: Payload, poller: Data<SpotifyPoller>) -> HttpResult<SpotifyPollerError> {
    // Declare the websocket handler.
    //
    // We don't care about the stream
    // because we are not going
    // to be receiving any data.
    let (res, mut session, _stream) = handle_ws(&req, stream)
        .map_err(|err| SpotifyPollerError::Ws(format!("{err:#}")))?;

    // We send all the events to syncronize
    // this specific client.
    for event in poller.sync().await? {
        // We send all the events
        // and ignore the error, since
        // the error only tells us if the
        // client disconnected.
        //
        // Since we didn't subscribe the
        // client yet it doesn't matter.
        //
        // If there is an error sending
        // actual new events then the client
        // gets removed.
        session.text(to_json(&event)?).await.ok();
    }

    // We clone the poller shared reference
    // that data contains and obtain
    // the receiver.
    //
    // If the receiver couldn't be obtained due
    // to the poller internal status, a NotAcceptable
    // http status code will be sent instead.
    let receiver = Arc::clone(&poller)
        .get_receiver()
        .await
        .map_err(|err| SpotifyPollerError::Subscription(err.to_string()))?;

    spawn(async move {
        loop {
            // We lock the receiver to this thread.
            let mut receiver = receiver.lock().await;

            // We rather have the event not sent
            // than the whole backend being down.
            if let Ok(event) = receiver.recv().await {
                // We serialize the event to json
                // with the custom implemented serializer.
                if let Ok(event) = to_json(&event) {
                    // If there is any error while sending
                    // meaning that the client is not there
                    // anymore, we simply break the loop.
                    if let Err(_) = session.text(event).await {
                        break;
                    }
                }
            }
        }
    });

    Ok(res)
}
