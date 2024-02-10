import "../App.css";
import { useNodeContext } from "../NodeContext";
import { useState } from "react";

function Send() {
	const { send_onchain_transaction } = useNodeContext();
	const [amount, setAmount] = useState("0");
	const [feeRate, setFeeRate] = useState("0");
	const [address, setAddress] = useState("");

	return (
		<div className="container">
			<div style={{ padding: "1em" }}>
				<input
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					style={{ width: "100%" }}
				/>
			</div>
			<div style={{ padding: "1em" }}>
				<input
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
					style={{ width: "100%" }}
				/>
			</div>
			<div style={{ padding: "1em" }}>
				<input
					value={feeRate}
					onChange={(e) => setFeeRate(e.target.value)}
					style={{ width: "100%" }}
				/>
			</div>
			<div style={{ padding: "1em" }}>
				<button
					onClick={() =>
						send_onchain_transaction(address, parseInt(amount))
					}
					style={{ width: "100%" }}
				>
					send
				</button>
			</div>
		</div>
	);
}

export default Send;
