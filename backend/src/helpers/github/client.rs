use actix_error_proc::ActixError;
use thiserror::Error;
use std::env::var;

#[derive(ActixError ,Error, Debug)]
pub enum GithubClientError {
    #[error("Error while obtaining environment variable for '{0}'.")]
    AuthNotFound(String)
}

pub struct GithubClient {
    token: String,
    username: String
}

impl GithubClient {
    pub fn new(token: &str, username: &str) -> Self {
        Self {
            token: token.to_string(),
            username: username.to_string()
        }
    }

    pub fn from_env(prefix: &str) -> Result<Self, GithubClientError> {
        macro_rules! penv {
            ($str:literal) => {
                var(format!("{}{}", prefix, $str))
                    .map_err(|_| GithubClientError::AuthNotFound($str.into()))
            };
        }

        Ok(Self {
            token: penv!("TOKEN")?,
            username: penv!("USERNAME")?
        })
    }

    pub async fn fetch_repositories() -> Result<(), GithubClientError> {
        Ok(())
    }
}
