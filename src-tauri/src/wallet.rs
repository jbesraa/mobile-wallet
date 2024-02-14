use std::io::Write;

use bip39::Mnemonic;
use ldk_node::bitcoin::Network;
use serde::{Deserialize, Serialize};

use crate::{
    lightning::{self, NodeConf},
    paths::UserPaths,
};

// home_dir/.bits-wallet/wallets/
// home_dir/.bits-wallet/wallets/wallet_name/seed
// home_dir/.bits-wallet/wallets/wallet_name/config.json
// home_dir/.bits-wallet/wallets/wallet_name/ldk-data/

pub struct Wallet;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct WalletConfig {
    listening_address: String,
    esplora_address: String,
}

impl WalletConfig {
    pub fn new() -> anyhow::Result<Self> {
        let config_file = UserPaths::config_file();
        let config_file = match std::fs::read(config_file) {
            Ok(s) => s,
            Err(e) => {
                return Err(anyhow::anyhow!(
                    "Failed to read config file for wallet: {}",
                    e
                ))
            }
        };
        let config: WalletConfig = match serde_json::from_slice(&config_file) {
            Ok(c) => c,
            Err(e) => {
                return Err(anyhow::anyhow!(
                    "Failed to parse config file for wallet {}",
                    e
                ))
            }
        };
        Ok(config)
    }
    pub fn update(&mut self, listening_address: String, esplora_address: String) -> bool {
        self.listening_address = listening_address;
        self.esplora_address = esplora_address;
        self.write()
    }
    fn write(&self) -> bool {
        let config_file = UserPaths::config_file();
        let mut config_file = match std::fs::File::create(config_file) {
            Ok(file) => file,
            Err(_) => return false,
        };
        let pretty_json = match serde_json::to_string_pretty(&self) {
            Ok(s) => s,
            Err(_) => return false,
        };
        match config_file.write_all(pretty_json.as_bytes()) {
            Ok(_) => {}
            Err(_) => return false,
        };
        match config_file.sync_all() {
            Ok(_) => true,
            Err(_) => false,
        }
    }
    // set listening address
    fn listening_address(&mut self, listening_address: String) {
        self.listening_address = listening_address;
    }
    // set esplora address
    fn esplora_address(&mut self, esplora_address: String) {
        self.esplora_address = esplora_address;
    }
    // get listening address
    pub fn get_listening_address(&self) -> String {
        self.listening_address.clone()
    }
    // get esplora address
    pub fn get_esplora_address(&self) -> String {
        self.esplora_address.clone()
    }
}

impl Wallet {
    pub fn new(
        network: Network,
        seed: Vec<u8>,
        listening_address: String,
        esplora_address: String,
    ) -> anyhow::Result<()> {
        let ldk_data_dir = UserPaths::ldk_data_dir();
        let node_conf = NodeConf {
            network,
            storage_dir: ldk_data_dir,
            listening_address,
            seed,
            esplora_address,
        };
        if let Some(_) = lightning::init_lazy(Some(node_conf)) {
            dbg!("Lightning node initialized");
        } else {
            dbg!("Lightning node failed to initialize");
        }
        Ok(())
    }
    fn update_config(esplora_address: String, listening_address: String) -> bool {
        match WalletConfig::new() {
            Ok(mut config) => config.update(listening_address, esplora_address),
            Err(_) => false,
        }
    }
}

#[tauri::command]
pub fn create_wallet(listening_address: String, esplora_address: String) -> Result<String, ()> {
    let seed = create_dirs(listening_address.clone(), esplora_address.clone());
    Wallet::new(Network::Regtest, seed.clone(), listening_address, esplora_address).unwrap();
    Ok("".to_string())
}

#[tauri::command]
pub fn update_config(listening_address: String, esplora_address: String) -> bool {
    Wallet::update_config(esplora_address, listening_address)
}

#[tauri::command]
pub fn create_dirs(listening_address: String, esplora_address: String) -> Vec<u8> {
    let project_base_dir = UserPaths::project_base_dir();
    std::fs::create_dir_all(&project_base_dir).unwrap();
    let ldk_data_dir = UserPaths::ldk_data_dir();
    std::fs::create_dir_all(&ldk_data_dir).unwrap();
    let mnemonic = Mnemonic::generate(12).unwrap();
    let seed = mnemonic.to_seed_normalized("");
    dbg!("Seed: {:?}", seed);
    let seed_file = UserPaths::seed_file();
    let mut seed_file = std::fs::File::create(seed_file).unwrap();
    seed_file.write_all(&seed).unwrap();
    seed_file.sync_all().unwrap();
    let config = WalletConfig {
        listening_address,
        esplora_address,
    };
    config.write();
    seed.to_vec()
}
