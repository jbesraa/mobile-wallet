import "./App.css";
import { invoke } from "@tauri-apps/api/core";
import { useNodeContext } from "./NodeContext";
import { useEffect, useState } from "react";
import { CreateWalletInput } from "./types";

function App() {
	const [balance, setBalance] = useState(0);
	const {
		list_wallets,
		create_wallet,
		get_our_address,
		get_node_id,
		start_node,
		is_node_running,
		new_onchain_address,
		list_peers,
		get_total_onchain_balance,
	} = useNodeContext();
	const [walllets, setWallets] = useState([]);
	const [nodeId, setNodeId] = useState("");
	const [address, setAddress] = useState("");
	const [isRunning, setIsRunning] = useState(false);
	const [onchainAdd, setOnchainAdd] = useState("");

	async function list_ws() {
		let wallets = await list_wallets();
		setWallets(wallets);
		const listeningAddress = await get_our_address(wallets[0]);
		const nodeId = await get_node_id(wallets[0]);
		setAddress(listeningAddress);
		setNodeId(nodeId);
		console.log(wallets);
	}

	async function start() {
		console.log("start_node");
		await start_node("andwallet");
	}

	async function createdirs() {
		const res = await invoke("create_dirs", {
			walletName: "andwallet",
		});
			console.log(res);
		// console.log(res);
	}

	// useEffect(() => {
	// 	create_wallet({} as CreateWalletInput);
	// 	// list_ws();
	// 	// createdirs()
	// }, []);

	useEffect(() => {
		const timer = setInterval(async () => {
			const isRunning = await is_node_running(
				"andwallet"
			);
			setIsRunning(isRunning);
		}, 3000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		const handler = async () => {
			if(isRunning){
				let on_chain_address = await get_total_onchain_balance("andwallet");
				setOnchainAdd(on_chain_address)
			}
		}
		handler()
	}, [isRunning]);

	return (
		<div className="container">
			<h1>{balance} BTC</h1>
			<div style={{ padding: "1em" }}>
				<button onClick={start} style={{ width: "100%" }}>
					start
				</button>
			</div>
			<div style={{ padding: "1em" }}>
				<button style={{ width: "100%" }}>Receive</button>
			</div>
			<div>{JSON.stringify(walllets)}</div>
			<div>{address}</div>
			<div>{nodeId}</div>
			<div>{String(isRunning)}</div>
			<div>{onchainAdd}</div>
		</div>
	);
}

export default App;
