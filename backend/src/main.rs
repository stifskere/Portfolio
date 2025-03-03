use actix_web::{main, App, HttpServer};
use thiserror::Error;
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
    HttpServer::new(|| {
        App::new()
    })
        .bind(("127.0.0.1", 3001))?
        .run()
        .await?;

    Ok(())
}
