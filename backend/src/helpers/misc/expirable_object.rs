use std::time::{SystemTimeError, UNIX_EPOCH};

macro_rules! now {
    () => {
        std::time::SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs()
    };
}

pub enum ExpirableObject<'v, T> {
    OnTime(&'v T),

    Expired
}

pub struct Expirable<T>(T, u64);

impl<T> Expirable<T> {
    pub fn new(object: T, expiration_time: u64) -> Self {
        Self(object, expiration_time)
    }

    pub fn new_relative(object: T, expires_in: u64) -> Result<Self, SystemTimeError> {
        Ok(Self::new(
            object,
            now!() + expires_in
        ))
    }

    pub fn get<'s:'v, 'v>(&'s self) -> Result<ExpirableObject<'v, T>, SystemTimeError> {
        Ok(match self.1 > now!() {
            true => ExpirableObject::OnTime(&self.0),
            false => ExpirableObject::Expired
        })
    }
}

impl<T: Default> Expirable<T> {
    pub fn new_expired() -> Self {
        Self(T::default(), 0)
    }
}
