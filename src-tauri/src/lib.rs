// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
pub mod lightning;
use tauri_plugin_log::{Target, TargetKind};
pub mod paths;
pub mod wallet;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([Target::new(TargetKind::Stdout)])
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            wallet::create_wallet,
            lightning::start_node,
            lightning::stop_node,
            lightning::get_node_id,
            lightning::is_node_running,
            lightning::get_esplora_address,
            lightning::get_listening_address,
            lightning::get_onchain_address,
            lightning::get_onchain_balance,
            lightning::send_onchain_transaction,
            lightning::create_invoice,
            lightning::pay_invoice,
            lightning::list_onchain_transactions,
            lightning::decode_invoice,
            // lightning::get_listening_address,
            // lightning::connect_to_node,
            // lightning::list_peers,
            // lightning::new_onchain_address,
            // lightning::disconnect_peer,
            // lightning::list_channels,
            // lightning::create_invoice,
            // lightning::pay_invoice,
            // lightning::open_channel,
            // lightning::close_channel,
            // lightning::total_onchain_balance,
            // lightning::sync_wallet,
            // wallet::update_config,
            // bitcoin::load_wallet,
            // bitcoin::get_new_address,
            // bitcoin::create_transaction,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
