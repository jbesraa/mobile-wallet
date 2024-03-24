use std::io::Write;

use reqwest::{
    header::{HeaderMap, HeaderValue, AUTHORIZATION},
    StatusCode,
};

use crate::paths::UserPaths;

#[tauri::command]
pub fn save_token(token: String) -> bool {
    dbg!(&token);
    let token_folder = UserPaths::token_project_base_dir();
    std::fs::create_dir_all(token_folder).unwrap();
    let desktop_token_path = UserPaths::desktop_token();
    dbg!(&desktop_token_path);
    let mut token_file = std::fs::File::create(desktop_token_path).unwrap();
    token_file.write_all(&token.as_bytes()).unwrap();
    match token_file.sync_all() {
        Ok(_) => true,
        Err(_) => false
    }
}

#[tauri::command]
pub fn read_token() -> String {
    let desktop_token_path = UserPaths::desktop_token();
    match std::fs::read_to_string(desktop_token_path) {
        Ok(r) => r,
        Err(_) => "".to_string(),
    }
}

fn build_headers() -> HeaderMap {
    let mut headers = HeaderMap::new();
    let token: HeaderValue = HeaderValue::from_str(&read_token()).unwrap();
    headers.insert(AUTHORIZATION, token);
    headers
}

#[tauri::command]
pub async fn create_bolt12_offer() -> String {
    let client = reqwest::Client::new();
    let response = client
        .get("http://0.0.0.0:8283/offer")
        .headers(build_headers())
        .send()
        .await
        .unwrap();
    let invoice = response.text().await.unwrap();
    invoice
}

#[tauri::command]
pub async fn pay_bolt12_offer(offer: String) -> bool {
    let client = reqwest::Client::new();
    let response = client
        .post("http://0.0.0.0:8283/offer")
        .body(offer)
        .headers(build_headers())
        .send()
        .await
        .unwrap();
    StatusCode::is_success(&response.status())
}

#[tauri::command]
pub async fn get_balance() -> String {
    let client = reqwest::Client::new();
    let response = client
        .get("http://0.0.0.0:8283/balance")
        .headers(build_headers())
        .send()
        .await
        .unwrap();
    let invoice = response.text().await.unwrap();
    invoice
}

#[tauri::command]
pub async fn list_payments() -> String {
    let client = reqwest::Client::new();
    let response = client
        .get("http://0.0.0.0:8283/payment/list")
        .headers(build_headers())
        .send()
        .await
        .unwrap();
    let invoice = response.text().await.unwrap();
    invoice
}
