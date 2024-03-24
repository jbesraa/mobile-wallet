use ldk_node::bitcoin::secp256k1::PublicKey;
use ldk_node::bitcoin::Network;
use ldk_node::io::sqlite_store::SqliteStore;
use ldk_node::lightning::ln::msgs::SocketAddress;
use ldk_node::lightning::offers::offer::Offer;
use ldk_node::lightning_invoice::{Bolt11Invoice, SignedRawBolt11Invoice};
use ldk_node::{Builder, LogLevel, Node};
use std::str::FromStr;
use std::sync::{Mutex, OnceLock};

use crate::paths::UserPaths;
use crate::wallet::WalletConfig;

#[tauri::command]
pub fn start_node() -> (bool, String) {
    let seed = match std::fs::read(UserPaths::seed_file()) {
        Ok(s) => s,
        Err(e) => {
            return (false, e.to_string());
        }
    };
    let config = match WalletConfig::new() {
        Ok(c) => c,
        Err(e) => {
            return (false, e.to_string());
        }
    };
    if let Some(node) = init_lazy(Some(NodeConf {
        network: ldk_node::bitcoin::Network::Signet,
        seed,
        storage_dir: UserPaths::ldk_data_dir(),
        listening_address: config.get_listening_address(),
        esplora_address: "https://mutinynet.com/api".to_string()
    })) {
        match node.start() {
            Ok(_) => {
                dbg!("Node started");
                std::thread::spawn(move || loop {
                    let event = node.wait_next_event();
                    println!("EVENT: {:?}", event);
                    node.event_handled();
                });
                (true, "".to_string())
            }
            Err(e) => {
                dbg!("Node not started");
                return (false, e.to_string());
            }
        }
    } else {
        return (false, "Failed to start node".to_string());
    }
}

#[tauri::command]
pub fn stop_node() -> bool {
    let node = init_lazy(None).expect("Failed to initialize node");
    match node.stop() {
        Ok(_) => {
            dbg!("Node stopped");
            return true;
        }
        Err(_) => return false,
    };
}

#[tauri::command]
pub fn get_node_id() -> String {
    let node = init_lazy(None).expect("Failed to initialize node");
    node.node_id().to_string()
}

#[tauri::command]
pub fn is_node_running() -> bool {
    match init_lazy(None) {
        Some(node) => {
            dbg!("FOUND");
            // let isrunning = node.is_running();
            // dbg!(&isrunning);
            // isrunning
            false
        }
        None => {
            dbg!("NOTFOUND");
            return false;
        }
    }
}

#[tauri::command]
pub fn get_esplora_address() -> String {
    let config: WalletConfig = match WalletConfig::new() {
        Ok(c) => c,
        Err(_) => return "".to_string(),
    };
    return config.get_esplora_address();
}

#[tauri::command]
pub fn get_listening_address() -> String {
    let config: WalletConfig = match WalletConfig::new() {
        Ok(c) => c,
        Err(_) => return "".to_string(),
    };
    return config.get_listening_address();
}

#[tauri::command]
pub fn get_onchain_address() -> String {
    let node = match init_lazy(None) {
        Some(n) => n,
        None => {
            dbg!("Failed to initialize node in new_onchain_address()");
            return "".to_string();
        }
    };
    match node.onchain_payment().new_address() {
        Ok(a) => a.to_string(),
        Err(e) => {
            dbg!(e);
            "".to_string()
        }
    }
}

#[tauri::command]
pub fn get_onchain_balance() -> u64 {
    let node = match init_lazy(None) {
        Some(n) => n,
        None => {
            dbg!("Failed to initialize node in new_onchain_address()");
            return 0;
        }
    };
    node.list_balances().total_onchain_balance_sats
}

// #[tauri::command]
// pub fn send_onchain_transaction(address: String, amount_sats: u64) -> bool {
//     let node = match init_lazy(None) {
//         Some(n) => n,
//         None => {
//             dbg!("Failed to initialize node in new_onchain_address()");
//             return false;
//         }
//     };
//     let txid = match node.send_to_onchain_address(
//         &ldk_node::bitcoin::Address::from_str(&address)
//             .unwrap()
//             .assume_checked(),
//         amount_sats,
//     ) {
//         Ok(txid) => txid,
//         Err(e) => {
//             dbg!(e);
//             return false;
//         }
//     };
//     dbg!(txid);
//     true
// }

#[tauri::command]
pub fn create_invoice(amount_sats: u64, description: &str) -> Option<String> {
    dbg!("Creating invoice...");
    let node = match init_lazy(None) {
        Some(n) => n,
        None => {
            dbg!("Failed to initialize node in create_invoice()");
            return None;
        }
    };
    dbg!("Got the node, Creating invoice...");
    match node.bolt12_payment().receive(
        amount_sats * 1000, //sats to msats
        description,
    ) {
        Ok(i) => Some(i.to_string()),
        Err(e) => {
            dbg!(&e);
            None
        }
    }
}

/// decode bolt11 invoice
#[tauri::command]
pub fn decode_invoice(invoice: String) -> Option<(String, u64)> {
    let invoice = match SignedRawBolt11Invoice::from_str(&invoice) {
        Ok(i) => i,
        Err(e) => {
            dbg!(&e);
            return None;
        }
    };
    let invoice = match Bolt11Invoice::from_signed(invoice) {
        Ok(i) => i,
        Err(e) => {
            dbg!(&e);
            return None;
        }
    };
    let description = invoice.description().to_string();
    let amount_sats = match invoice.amount_milli_satoshis() {
        Some(a) => a / 1000,
        None => 0,
    };
    Some((description, amount_sats))
}

/// returns payment hash if successful
#[tauri::command]
pub fn pay_invoice(offer: String, token: String) -> Option<[u8; 32]> {
    let node = init_lazy(None).expect("Failed to initialize node");
    let offer = match Offer::from_str(&offer) {
        Ok(i) => i,
        Err(e) => {
            dbg!(&e);
            return None;
        }
    };
    match node.bolt12_payment().send(&offer, Some(token)) {
        Ok(p) => Some(p.0),
        Err(e) => {
            dbg!(&e);
            None
        }
    }
}

#[tauri::command]
pub fn open_channel(
    node_id: String,
    net_address: String,
    channel_amount_sats: u64,
    push_to_counterparty_msat: u64,
    announce_channel: bool,
) -> bool {
    let empty_result = false;
    let node = init_lazy(None).expect("Failed to initialize node");
    let target_node_id = match PublicKey::from_str(&node_id) {
        Ok(key) => key,
        Err(e) => {
            dbg!(&e);
            return empty_result;
        }
    };
    let target_address = match SocketAddress::from_str(&net_address) {
        Ok(address) => address,
        Err(e) => {
            dbg!(&e);
            return false;
        }
    };
    let push_to_counterparty_msat: Option<u64> = if push_to_counterparty_msat > 1 {
        Some(push_to_counterparty_msat)
    } else {
        None
    };
    let channel_config = None;
    match node.connect_open_channel(
        target_node_id,
        target_address,
        channel_amount_sats,
        push_to_counterparty_msat,
        channel_config,
        announce_channel,
    ) {
        Ok(_) => true,
        Err(e) => {
            dbg!(&e);
            false
        }
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct WalletTx {
    pub txid: String,
    pub received: u64,
    pub sent: u64,
}

// #[tauri::command]
// pub fn list_onchain_transactions() -> Vec<WalletTx> {
//     let node = init_lazy(None).expect("Failed to initialize node");
//     let txs = node.list_onchain_transactions().unwrap();
//     dbg!(&txs);
//     txs.into_iter().map(|tx| tx.into()).collect()
// }

// impl From<TransactionDetails> for WalletTx {
//     fn from(tx: TransactionDetails) -> Self {
//         WalletTx {
//             txid: tx.txid.to_string(),
//             sent: tx.sent,
//             received: tx.received,
//         }
//     }
// }

#[tauri::command]
pub fn send_onchain_transaction(address: String, amount_sats: u64, _fee_rate: u32) -> bool {
    let node = match init_lazy(None) {
        Some(n) => n,
        None => {
            dbg!("Failed to initialize node in new_onchain_address()");
            return false;
        }
    };
    let txid = match node.onchain_payment().send_to_address(
        &ldk_node::bitcoin::Address::from_str(&address)
            .unwrap()
            .assume_checked(),
        amount_sats,
    ) {
        Ok(txid) => txid,
        Err(e) => {
            dbg!(e);
            return false;
        }
    };
    dbg!(txid);
    true
}

// #[derive(serde::Serialize, serde::Deserialize)]
// pub struct ChanDetails {
//     pub channel_id: [u8; 32],
//     pub counterparty_node_id: PublicKey,
//     pub funding_txo: Option<OutPoint>,
//     pub channel_value_sats: u64,
//     pub unspendable_punishment_reserve: Option<u64>,
//     pub feerate_sat_per_1000_weight: u32,
//     pub balance_msat: u64,
//     pub outbound_capacity_msat: u64,
//     pub inbound_capacity_msat: u64,
//     pub confirmations_required: Option<u32>,
//     pub confirmations: Option<u32>,
//     pub is_outbound: bool,
//     pub is_channel_ready: bool,
//     pub is_usable: bool,
//     pub is_public: bool,
//     pub cltv_expiry_delta: Option<u16>,
// }

// impl From<ChannelDetails> for ChanDetails {
//     fn from(channel_details: ChannelDetails) -> Self {
//         ChanDetails {
//             counterparty_node_id: channel_details.counterparty_node_id,
//             funding_txo: channel_details.funding_txo,
//             channel_id: channel_details.channel_id.0,
//             channel_value_sats: channel_details.channel_value_sats,
//             unspendable_punishment_reserve: channel_details.unspendable_punishment_reserve,
//             feerate_sat_per_1000_weight: channel_details.feerate_sat_per_1000_weight,
//             balance_msat: channel_details.balance_msat,
//             outbound_capacity_msat: channel_details.outbound_capacity_msat,
//             inbound_capacity_msat: channel_details.inbound_capacity_msat,
//             confirmations_required: channel_details.confirmations_required,
//             confirmations: channel_details.confirmations,
//             is_outbound: channel_details.is_outbound,
//             is_channel_ready: channel_details.is_channel_ready,
//             is_usable: channel_details.is_usable,
//             is_public: channel_details.is_public,
//             cltv_expiry_delta: channel_details.cltv_expiry_delta,
//         }
//     }
// }

// #[derive(serde::Serialize, serde::Deserialize, Debug)]
// pub struct WrappedPaymentDetails {
//     /// The payment hash, i.e., the hash of the `preimage`.
//     pub hash: [u8; 32],
//     /// The pre-image used by the payment.
//     pub preimage: Option<[u8; 32]>,
//     /// The secret used by the payment.
//     pub secret: Option<[u8; 32]>,
//     /// The amount transferred.
//     pub amount_msat: Option<u64>,
//     /// The direction of the payment.
//     pub direction: String,
//     /// The status of the payment.
//     pub status: String,
// }

// impl From<PaymentDetails> for WrappedPaymentDetails {
//     fn from(payment_details: PaymentDetails) -> Self {
//         return WrappedPaymentDetails {
//             hash: payment_details.hash.0,
//             preimage: match payment_details.preimage {
//                 Some(p) => Some(p.0),
//                 None => None,
//             },
//             secret: match payment_details.secret {
//                 Some(s) => Some(s.0),
//                 None => None,
//             },
//             amount_msat: payment_details.amount_msat,
//             direction: match payment_details.direction {
//                 PaymentDirection::Inbound => "Inbound".to_string(),
//                 PaymentDirection::Outbound => "Outbound".to_string(),
//             },
//             status: match payment_details.status {
//                 PaymentStatus::Pending => "Pending".to_string(),
//                 PaymentStatus::Succeeded => "Succeeded".to_string(),
//                 PaymentStatus::Failed => "Failed".to_string(),
//             },
//         };
//     }
// }

// #[tauri::command]
// pub fn list_payments(node_name: String) -> Vec<WrappedPaymentDetails> {
//     let node = init_lazy(None).expect("Failed to initialize node");
//     node.list_payments()
//         .into_iter()
//         .map(|c: PaymentDetails| WrappedPaymentDetails::from(c))
//         .collect()
// }

// #[tauri::command]
// pub fn list_channels(node_name: String) -> Vec<ChanDetails> {
//     let node = init_lazy(None).expect("Failed to initialize node");
//     node.list_channels()
//         .into_iter()
//         .map(|c: ChannelDetails| ChanDetails::from(c))
//         .collect()
// }

// #[tauri::command]
// pub fn create_invoice(
//     node_name: String,
//     amount_msat: u64,
//     description: &str,
//     expiry_secs: u32,
// ) -> Option<String> {
//     let node = init_lazy(None).expect("Failed to initialize node");
//     match node.receive_payment(amount_msat, description, expiry_secs) {
//         Ok(i) => Some(i.into_signed_raw().to_string()),
//         Err(e) => {
//             dbg!(&e);
//             None
//         }
//     }
// }

// /// returns payment hash if successful
// #[tauri::command]
// pub fn pay_invoice(node_name: String, invoice: String) -> Option<[u8; 32]> {
//     let node = init_lazy(None).expect("Failed to initialize node");
//     let invoice = match SignedRawBolt11Invoice::from_str(&invoice) {
//         Ok(i) => i,
//         Err(e) => {
//             dbg!(&e);
//             return None;
//         }
//     };
//     let invoice = match Bolt11Invoice::from_signed(invoice) {
//         Ok(i) => i,
//         Err(e) => {
//             dbg!(&e);
//             return None;
//         }
//     };
//     match node.send_payment(&invoice) {
//         Ok(p) => Some(p.0),
//         Err(e) => {
//             dbg!(&e);
//             None
//         }
//     }
// }

// #[tauri::command]
// pub fn disconnect_peer(node_name: String, node_id: String) -> bool {
//     let node = init_lazy(None).expect("Failed to initialize node");
//     let pub_key = match PublicKey::from_str(&node_id) {
//         Ok(key) => key,
//         Err(e) => {
//             dbg!(&e);
//             return false;
//         }
//     };
//     match node.disconnect(pub_key) {
//         Ok(_) => return true,
//         Err(e) => {
//             dbg!(&e);
//             return false;
//         }
//     };
// }

// #[tauri::command]
// pub fn connect_to_node(our_node_name: String, node_id: String, net_address: String) -> bool {
//     let persist = true;
//     let node = init_lazy(None).expect("Failed to initialize node");
//     let pub_key = match PublicKey::from_str(&node_id) {
//         Ok(key) => key,
//         Err(e) => {
//             dbg!(&e);
//             return false;
//         }
//     };
//     let listening_address = match SocketAddress::from_str(&net_address) {
//         Ok(address) => address,
//         Err(e) => {
//             dbg!(&e);
//             return false;
//         }
//     };
//     match node.connect(pub_key, listening_address, persist) {
//         Ok(_) => return true,
//         Err(e) => {
//             dbg!(&e);
//             return false;
//         }
//     };
// }

// #[derive(serde::Serialize, serde::Deserialize, Debug)]
// pub struct WrappedPeerDetails {
//     /// The node ID of the peer.
//     pub node_id: PublicKey,
//     /// The network address of the peer.
//     pub address: String,
//     /// Indicates whether we'll try to reconnect to this peer after restarts.
//     pub is_persisted: bool,
//     /// Indicates whether we currently have an active connection with the peer.
//     pub is_connected: bool,
//     /// The alias of the peer, if known.
//     pub alias: String,
// }

// impl From<PeerDetails> for WrappedPeerDetails {
//     fn from(peer_details: PeerDetails) -> Self {
//         WrappedPeerDetails {
//             node_id: peer_details.node_id,
//             address: peer_details.address.to_string(),
//             alias: "".to_string(),
//             is_persisted: peer_details.is_persisted,
//             is_connected: peer_details.is_connected,
//         }
//     }
// }

// #[tauri::command]
// pub fn list_peers() -> Vec<WrappedPeerDetails> {
//     let node = init_lazy(None).expect("Failed to initialize node");
//     node.list_peers()
//         .into_iter()
//         .map(|peer: PeerDetails| peer.into())
//         .collect()
// }

// #[tauri::command]
// pub fn spendable_on_chain() -> u64 {
//     let node = init_lazy(None).expect("Failed to initialize node");
//     match node.spendable_onchain_balance_sats() {
//         Ok(b) => return b,
//         Err(e) => {
//             dbg!(&e);
//             return 0;
//         }
//     }
// }

// #[tauri::command]
// pub fn total_onchain_balance() -> u64 {
//     let node = init_lazy(None).expect("Failed to initialize node");
//     match node.total_onchain_balance_sats() {
//         Ok(b) => {
//             return b;
//         }
//         Err(e) => {
//             dbg!(&e);
//             return 0;
//         }
//     }
// }

#[derive(serde::Serialize, serde::Deserialize, Debug)]
pub struct NodeConf {
    pub network: ldk_node::bitcoin::Network,
    pub storage_dir: String,
    pub listening_address: String,
    pub seed: Vec<u8>,
    pub esplora_address: String,
}

static IS_OUR_NODE_INIT: OnceLock<Mutex<bool>> = OnceLock::new();
static OUR_NODE: OnceLock<Node> = OnceLock::new();

pub fn init_lazy(init_config: Option<NodeConf>) -> Option<&'static Node> {
    match OUR_NODE.get() {
        Some(_) => return OUR_NODE.get(),
        None => {
            let config = match init_config {
                Some(c) => c,
                None => {
                    return None;
                }
            };
            let initializing_mutex: &Mutex<bool> =
                IS_OUR_NODE_INIT.get_or_init(|| std::sync::Mutex::new(false));
            let mut initialized = initializing_mutex.lock().unwrap();
            if !*initialized {
                let node = Builder::new()
                    .set_network(Network::Signet)
                    .set_log_level(LogLevel::Info)
                    .set_log_dir_path(format!("{}/logs", &config.storage_dir))
                    .set_storage_dir_path(config.storage_dir)
                    .set_esplora_server(config.esplora_address)
                    .set_listening_addresses(vec![SocketAddress::from_str(
                        &config.listening_address,
                    )
                    .unwrap()])
                    .unwrap()
                    .set_gossip_source_rgs(
                        "https://rapidsync.lightningdevkit.org/testnet/snapshot".to_string(),
                    )
                    .build()
                    .unwrap();
                if let Ok(_) = OUR_NODE.set(node) {
                    *initialized = true;
                };
            }
            drop(initialized);
            OUR_NODE.get()
        }
    }
}
