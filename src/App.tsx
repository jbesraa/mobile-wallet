import "./App.css";
import { useNodeContext } from "./NodeContext";
import { useEffect, useState } from "react";
import { CreateWalletInput } from "./types";

function App() {
	const {
		create_wallet,
		start_node,
		get_node_id,
		is_node_running,
		get_esplora_address,
		get_listening_address,
	} = useNodeContext();
	const [nodeId, setNodeId] = useState("");
	const [listeningAddress, setListeningAddress] = useState("");
	const [esploraAddress, setEsploraAddress] = useState("");
	const [isRunning, setIsRunning] = useState(false);

	// async function start() {
	// 	console.log("start_node");
	// 	await start_node("andwallet");
	// }

	// async function createdirs() {
	// 	const res = await invoke("create_dirs", {
	// 		walletName: "andwallet",
	// 	});
	// 		console.log(res);
	// 	// console.log(res);
	// }

	// useEffect(() => {
	// 	create_wallet({} as CreateWalletInput);
	// 	// list_ws();
	// 	// createdirs()
	// }, []);

	useEffect(() => {
		const timer = setInterval(async () => {
			const isRunning = await is_node_running();
			setIsRunning(isRunning);
		}, 3000);
		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		const handler = async () => {
			if(isRunning){
				const id = await get_node_id();
				const esplora = await get_esplora_address();
				const listening = await get_listening_address();
				setNodeId(id);
				setEsploraAddress(esplora);
				setListeningAddress(listening);
			}
		}
		handler()
	}, [isRunning]);

	return (
		<div className="container">
			<h1>0 BTC</h1>
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
					onClick={() => start_node()}
					style={{ width: "100%" }}
				>
					start node
				</button>
			</div>
			<div>{nodeId}</div>
			<div>{String(isRunning)}</div>
			<div>esplora address: {esploraAddress}</div>
			<div>listening address: {listeningAddress}</div>
		</div>
	);
}

export default App;
// <div style={{ padding: "1em" }}>
// 	<button onClick={start} style={{ width: "100%" }}>
// 		start wallet
// 	</button>
// </div>
