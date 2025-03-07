use dotenvy::{vars, dotenv};

fn main() {
    dotenv().ok();

    for (key, value) in vars() {
        println!("cargo::rustc-env=${key}=${value}");
    }
}
