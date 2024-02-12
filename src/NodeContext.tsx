import { invoke } from "@tauri-apps/api/core";
import { createContext, useContext } from "react";
import {
	ChannelDetails,
	PeerDetails,
	PaymentData,
	ConnectToPeerInput,
	UpdateConfigInput,
} from "./types";

export interface NodeActions {
	create_wallet: () => Promise<string>;
	start_node: () => Promise<[boolean, string]>;
	stop_node: () => Promise<boolean>;
	get_node_id: () => Promise<string>;
	get_esplora_address: () => Promise<string>;
	get_listening_address: () => Promise<string>;
	get_onchain_address: () => Promise<string>;
	get_onchain_balance: () => Promise<string>;
	send_onchain_transaction: (
		adress: string,
		amout_msat: number,
		fee_rate: number
	) => Promise<string>;
	create_invoice: (amount_sat: number, desc?: string) => Promise<string>;
	list_onchain_transactions:()  => Promise<Array<WalletTx>>;
	update_config: (i: UpdateConfigInput) => Promise<boolean>;
	get_logs: () => Promise<string[]>;
	sync_wallet: () => Promise<boolean>;
	connect_to_peer: (i: ConnectToPeerInput) => Promise<boolean>;
	list_peers: () => Promise<PeerDetails[]>;
	new_onchain_address: () => Promise<string>;
	is_node_running: () => Promise<boolean>;
	get_total_onchain_balance: (nodeName: string) => Promise<number>;
	get_network: () => Promise<string>;
	list_channels: () => Promise<ChannelDetails[]>;
	list_payments: () => Promise<PaymentData[]>;
}

interface WalletTx {
	txid: string;
	sent: number;
	received: number;
}

export const useNodeContext = () => useContext(NodeContext);

export const NodeContext = createContext({} as NodeActions);

export const NodeContextProvider = ({ children }: { children: any }) => {
	async function create_wallet(): Promise<string> {
		try {
			const res: string = await invoke("create_wallet", {
				listeningAddress: "0.0.0.0:9735",
				esploraAddress: "https://cedd-46-116-219-83.ngrok-free.app",
			});
			return res;
		} catch (e) {
			console.log("Error get_our_address", e);
			return "";
		}
	}

	async function start_node(): Promise<any> {
		try {
			const res: boolean = await invoke("start_node", {});
			return res;
		} catch (e) {
			console.log("Error Starting Node", e);
			return false;
		}
	}

	async function stop_node(): Promise<boolean> {
		try {
			const res: boolean = await invoke("stop_node", {});
			return res;
		} catch (e) {
			console.log("Error Stopping node", e);
			return false;
		}
	}

	async function get_node_id(): Promise<string> {
		try {
			const res: string = await invoke("get_node_id", {});
			return res;
		} catch (e) {
			console.log("Error get_node_id", e);
			return "";
		}
	}

	async function is_node_running(): Promise<boolean> {
		try {
			const res: boolean = await invoke("is_node_running", {});
			return res;
		} catch (e) {
			console.log("Error is_node_running", e);
			return false;
		}
	}

	async function get_esplora_address(): Promise<string> {
		try {
			const res: string = await invoke("get_esplora_address", {});
			return res;
		} catch (e) {
			console.log("Error get_esplora_address", e);
			return "";
		}
	}

	async function get_listening_address(): Promise<string> {
		try {
			const res: string = await invoke("get_listening_address", {});
			return res;
		} catch (e) {
			console.log("Error get_esplora_address", e);
			return "";
		}
	}

	async function get_onchain_address(): Promise<string> {
		try {
			const res: string = await invoke("get_onchain_address", {});
			return res;
		} catch (e) {
			console.log("Error get_esplora_address", e);
			return "";
		}
	}

	async function get_onchain_balance(): Promise<string> {
		try {
			const res: string = await invoke("get_onchain_balance", {});
			return res;
		} catch (e) {
			console.log("Error get_esplora_address", e);
			return "";
		}
	}

	async function send_onchain_transaction(
		address: string,
		amount_sat: number,
		fee_rate: number
	): Promise<string> {
		try {
			const res: string = await invoke("send_onchain_transaction", {
				address,
				amountSats: amount_sat,
				feeRate: fee_rate,
			});
			return res;
		} catch (e) {
			console.log("Error send_onchain_tx", e);
			return "";
		}
	}

	async function list_onchain_transactions(): Promise<Array<WalletTx>> {
		try {
			const txs: Array<WalletTx> = await invoke(
				"list_onchain_transactions",
				{}
			);
			return txs;
		} catch (e) {
			console.log("Error listing txs", e);
			return [];
		}
	}

	async function sync_wallet(): Promise<boolean> {
		try {
			const synced_wallet: boolean = await invoke("sync_wallet", {});
			return synced_wallet;
		} catch (e) {
			console.log("Error syncing wallet", e);
			return false;
		}
	}

	async function connect_to_peer(i: ConnectToPeerInput): Promise<boolean> {
		try {
			const { node_id, net_address } = i;
			const res: boolean = await invoke("connect_to_node", {
				nodeName: i.ourNodeName, // our nodename
				nodeId: node_id,
				netAddress: net_address,
			});
			return res;
		} catch (e) {
			console.log("Error Connecting To Peer", e);
			return false;
		}
	}

	async function list_peers(): Promise<PeerDetails[]> {
		try {
			const res: PeerDetails[] = await invoke("list_peers", {});
			console.log("peeers", res);
			return res;
		} catch (e) {
			console.log("Error Listing Peers ", e);
			return [] as PeerDetails[];
		}
	}

	async function new_onchain_address(): Promise<string> {
		try {
			const res: string = await invoke("new_onchain_address", {});
			return res;
		} catch (e) {
			console.log("Error new onchain address ", e);
			return "";
		}
	}

	async function get_network(): Promise<string> {
		try {
			const network: string = await invoke("get_network", {});
			return network;
		} catch (e) {
			console.log("Error get_network", e);
			return "";
		}
	}

	async function get_total_onchain_balance(): Promise<number> {
		try {
			const res: number = await invoke("total_onchain_balance", {});
			return res;
		} catch (e) {
			console.log("Error get_total_onchain_balance", e);
			return 0;
		}
	}

	async function create_invoice(
		amount_sat: number,
		desc?: string
	): Promise<string> {
		try {
			let res: string = await invoke("create_invoice", {
				amountSats: amount_sat,
				description: desc,
			});
			return res;
		} catch (e) {
			console.log(e);
			return "";
		}
	}

	async function get_logs(): Promise<string[]> {
		try {
			const res: string[] = await invoke("get_logs", {});
			return res;
		} catch (e) {
			console.log("Error get_logs", e);
			return [];
		}
	}

	async function list_payments(): Promise<PaymentData[]> {
		try {
			const res: PaymentData[] = await invoke("list_payments", {});
			return res;
		} catch (e) {
			console.log("Error list_payments", e);
			return [];
		}
	}

	async function list_channels(): Promise<ChannelDetails[]> {
		try {
			const res: ChannelDetails[] = await invoke("list_channels", {});
			return res;
		} catch (e) {
			console.log("Error list_channels", e);
			return [];
		}
	}

	async function update_config(i: UpdateConfigInput): Promise<boolean> {
		try {
			const res: boolean = await invoke("update_config", {
				...i,
			});
			return res;
		} catch (e) {
			console.log("Error update_config", e);
			return false;
		}
	}

	const state: NodeActions = {
		create_wallet,
		start_node,
		stop_node,
		get_node_id,
		get_esplora_address,
		get_listening_address,
		get_onchain_address,
		get_onchain_balance,
		send_onchain_transaction,
		create_invoice,
		list_onchain_transactions,
		sync_wallet,
		update_config,
		connect_to_peer,
		list_peers,
		new_onchain_address,
		is_node_running,
		get_total_onchain_balance,
		list_channels,
		list_payments,
		get_network,
		get_logs,
	};

	return (
		<NodeContext.Provider value={state}>{children}</NodeContext.Provider>
	);
};
