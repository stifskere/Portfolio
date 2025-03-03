use std::time::{SystemTimeError, UNIX_EPOCH};

macro_rules! now {
    () => {
        std::time::SystemTime::now().duration_since(UNIX_EPOCH)?.as_secs()
    };
}

/// An expirable object is a stateless
/// object that has an expiration time.
///
/// This object does not mutate, so if
/// the object is kept after the expiration
/// time, using it would make no sense.
///
/// Expiration times are calculated
/// in unix, thus if the expiration
/// time is below the current unix
/// timestamp, it means it's expired.
///
/// The unix timestamps are calculated
/// in seconds.
pub enum ExpirableObject<'v, T> {
    /// OnTime means that a value exists
    /// and it hasn't expired, this value
    /// will be expired once the expiry_time
    /// is below unix.now.
    OnTime(&'v T),

    /// An expired object means it
    /// doesn't have a value because
    /// it was initialized this way
    /// or because an OnTime object
    /// already expired.
    Expired
}

/// An Expirable<T> is a wraper for the
/// ExpirableObject, containing a value
/// that can only be obtained before
/// the internal expiry_time passes.
///
/// Expirable works with seconds.
pub struct Expirable<T>(T, u64);

impl<T> Expirable<T> {
    /// This function creates a new Expirable<T>
    /// with a set expiration time in seconds, it does
    /// not check whether the expiration time has passed
    /// or not.
    ///
    /// - object: This parameter is the object to store.
    /// - expiration_time: This parameter defines when does
    ///   the object expire.
    ///
    /// returns an instance of Expirable<T>.
    pub fn new(object: T, expiration_time: u64) -> Self {
        Self(object, expiration_time)
    }

    /// This function creates a new Expirable<T> relative
    /// to the creation time, so the expiration passed
    /// are seconds from now instead of a set expiration
    /// time.
    ///
    /// - object: This parameter is the object to store.
    /// - expires_in: This parameter is how many seconds are
    ///   remaining for the object to expire.
    ///
    /// returns a Result<Expirable<T>, SystemTimeError>
    /// where the result is an instance of Expirable<T> and
    /// the error represents a time calculation error.
    pub fn new_relative(object: T, expires_in: u64) -> Result<Self, SystemTimeError> {
        Ok(Self::new(
            object,
            now!() + expires_in
        ))
    }

    /// This function obtains the underlying value of this Expirable
    /// object in a very restrictive lifetime, this way making sure
    /// that the underlying object which is tied to expiration
    /// persists beyond the expiration time.
    ///
    /// returns a Result<ExpirableObject<T>, SystemTimeError>
    /// where the result is an ExpirableObject<T>, containing
    /// whether the value expired or not, the error represents
    /// a time calculation error.
    pub fn get<'s:'v, 'v>(&'s self) -> Result<ExpirableObject<'v, T>, SystemTimeError> {
        Ok(match self.1 > now!() /* The object didn't expire */ {
            true => ExpirableObject::OnTime(&self.0),
            false => ExpirableObject::Expired
        })
    }
}

impl<T: Default> Expirable<T> {
    /// This function only implemented if T implements
    /// default creates an expired Expirable<T>, where
    /// the value is a default (non accessible) and the
    /// expire time is 0, since 0 is less than the current
    /// unix timestamp in seconds the get function
    /// will always return ExpirableObject::Expired.
    ///
    /// returns a new expired Expirable<T>.
    pub fn new_expired() -> Self {
        Self(T::default(), 0)
    }
}
