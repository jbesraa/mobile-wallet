import "../App.css";
import { useNodeContext } from "../NodeContext";
import { useEffect, useState } from "react";
import { useRouterContext } from "../router";
import BoltIcon from "@mui/icons-material/Bolt";

function Home() {
	const { start_node, is_node_running, get_onchain_balance } =
		useNodeContext();
	const { push_route } = useRouterContext();
	const [balance, setBalance] = useState("0");
	const [isRunning, setIsRunning] = useState(false);

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
				setBalance(onchain_balance);
			}
		};
		handler();
	}, [isRunning]);

	return (
		<div className="container">
			<h1>
				{balance} SATS
				<span>
					<BoltIcon color={isRunning ? "success" : "error"} />
				</span>
			</h1>
			<div style={{ padding: "1em" }}>
				<button
					onClick={() => push_route("send")}
					style={{ width: "100%" }}
				>
					send
				</button>
			</div>
			<div style={{ padding: "1em" }}>
				<button
					onClick={() => push_route("receive")}
					style={{ width: "100%" }}
				>
					Receive
				</button>
			</div>
		</div>
	);
}

export default Home;
