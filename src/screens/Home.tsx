import "../App.css";
import { useNodeContext } from "../NodeContext";
import { useEffect, useState } from "react";
import { useRouterContext } from "../router";
import BoltIcon from "@mui/icons-material/Bolt";

function Home() {
	const {
		start_node,
		is_node_running,
		get_onchain_balance,
		list_onchain_transactions,
	} = useNodeContext();
	const { push_route } = useRouterContext();
	const [balance, setBalance] = useState("0");
	const [isRunning, setIsRunning] = useState(false);
	const [txs, setTxs] = useState<any>();

	useEffect(() => {
		const handler = async () => {
			const isRunning = await is_node_running();
			if (!isRunning) {
				await start_node();
			}
			const is_run = await is_node_running();
			setIsRunning(is_run);
		};
		handler();
	}, []);

	// useEffect(() => {
	// 	const timer = setInterval(async () => {
	// 		if (!isRunning) {
	// 			const isRunning = await is_node_running();
	// 			setIsRunning(isRunning);
	// 		}
	// 	}, 1000);
	// 	return () => clearInterval(timer);
	// }, []);

	useEffect(() => {
		const handler = async () => {
			if (isRunning) {
				const onchain_balance = await get_onchain_balance();
				const txs = await list_onchain_transactions();
				setBalance(onchain_balance);
				setTxs(txs);
			}
		}
		handler()
	}, [isRunning]);

	useEffect(() => {
		const timer = setInterval(async () => {
			if (isRunning) {
				const onchain_balance = await get_onchain_balance();
				const txs = await list_onchain_transactions();
				setBalance(onchain_balance);
				setTxs(txs);
			}
		}, 10000);
		return () => clearInterval(timer);
	}, [isRunning]);

	return (
		<div className="container">
			<h1>
				{balance} SATS
				<span>
					<BoltIcon color={isRunning ? "success" : "error"} />
				</span>
			</h1>
			<div style={{ padding: "1em", paddingBottom:"0.1em" }}>
				<button
					onClick={() => push_route("send")}
					style={{ width: "100%" }}
				>
					send
				</button>
			</div>
			<div style={{ padding: "1em", paddingTop: "0.1em" }}>
				<button
					onClick={() => push_route("receive")}
					style={{ width: "100%" }}
				>
					Receive
				</button>
			</div>

			<div style={{ height: "60vh", overflow: "scroll" }}>
				{txs?.map((tx: any) => {
					return (
						<div
							key={tx.txid}
							style={{
								borderBottom: "1px dotted black",
								display: "grid",
								padding: "1em",
								gridAutoFlow: "column",
							}}
						>
							{tx.sent > 0 ? (
							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
								<div style={{ justifySelf: "left" }}>{tx.sent} Sats</div>
								<div style={{ justifySelf: "right" }}>-</div>
</div>
							) : (
							<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
								<div style={{ justifySelf: "left", color: "green" }}>{tx.received} Sats</div>
								<div style={{ justifySelf: "right", color: "green" }}>+</div>
</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default Home;
