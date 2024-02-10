import "../App.css";
import { useNodeContext } from "../NodeContext";
import { useEffect, useState } from "react";

function Home() {
	const {
		create_wallet,
		start_node,
		get_node_id,
		is_node_running,
		get_esplora_address,
		get_listening_address,
		get_onchain_balance,
		get_onchain_address,
		send_onchain_transaction,
	} = useNodeContext();
	const [balance, setBalance] = useState("0");
	const [nodeId, setNodeId] = useState("");
	const [address, setAddress] = useState("");
	const [listeningAddress, setListeningAddress] = useState("");
	const [esploraAddress, setEsploraAddress] = useState("");
	const [isRunning, setIsRunning] = useState(false);
	// useEffect(() => {
	// 	create_wallet({} as CreateWalletInput);
	// 	// list_ws();
	// 	// createdirs()
	// }, []);

	useEffect(() => {
		const timer = setInterval(async () => {
			const isRunning = await is_node_running();
			const onchain_balance = await get_onchain_balance();
			setBalance(onchain_balance);
			setIsRunning(isRunning);
		}, 5000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		const handler = async () => {
			if (isRunning) {
				const id = await get_node_id();
				const esplora = await get_esplora_address();
				const listening = await get_listening_address();
				// const onchain_balance = await get_onchain_balance();
				const onchain_address = await get_onchain_address();
				// setBalance(onchain_balance);
				setAddress(onchain_address);
				setNodeId(id);
				setEsploraAddress(esplora);
				setListeningAddress(listening);
			}
		};
		handler();
	}, [isRunning]);

	return (
		<div className="container">
			<h1>{balance} SATS</h1>
			<div style={{ padding: "1em" }}>
				<button
					disabled={true}
					onClick={() => create_wallet()}
					style={{ width: "100%" }}
				>
					create wallet
				</button>
			</div>
			<div style={{ padding: "1em" }}>
				<button
					disabled={isRunning}
					onClick={() => start_node()}
					style={{ width: "100%" }}
				>
					start node
				</button>
			</div>
			<div>{nodeId}</div>
			<div>Address: {address}</div>
			<div>{String(isRunning)}</div>
			<div>esplora address: {esploraAddress}</div>
			<div>listening address: {listeningAddress}</div>
			<div style={{ padding: "1em" }}>
				<button
					onClick={() =>
						send_onchain_transaction(
							"bcrt1q755s2j3ud0k0dvfypl48qjqkn4fujg6ww0x9ur",
							500000
						)
					}
					style={{ width: "100%" }}
				>
					send
				</button>
			</div>
			<div style={{ padding: "1em" }}>
				<button
					disabled={true}
					onClick={() => {}}
					style={{ width: "100%" }}
				>
					Receive
				</button>
			</div>
		</div>
	);
}

export default Home;
