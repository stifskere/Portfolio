use actix_web::{web::scope, Scope};

mod currently_playing;

pub fn spotify_scope() -> Scope {
    scope("/spotify")
        .service(currently_playing::currently_playing)
}

