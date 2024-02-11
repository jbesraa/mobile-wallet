import "../App.css";
import { useNodeContext } from "../NodeContext";
import { useState } from "react";
import { useRouterContext } from "../router";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { Button, TextField, Typography } from "@mui/material";
import AppDrawer from "../Drawer";

function Send() {
	const { push_route } = useRouterContext();
	const { send_onchain_transaction } = useNodeContext();
	const [amount, setAmount] = useState("");
	const [feeRate, setFeeRate] = useState("");
	const [address, setAddress] = useState("");

	return (

		<>
		<div className="container">
			<div style={{ display: "grid", padding: "1em", gap: "1em" }}>
				<div style={{ justifySelf: "start" }}>
					<ArrowBackOutlinedIcon onClick={() => push_route("home")} />
				</div>
				<TextField
					id="outlined-basic"
					onChange={(e) => setAddress(e.target.value)}
					label="Address"
					value={address}
					variant="outlined"
				/>
				<TextField
					id="outlined-basic"
					onChange={(e) => setAmount(e.target.value)}
					label="Amount"
					value={amount}
					variant="outlined"
				/>
				<TextField
					id="outlined-basic"
					onChange={(e) => setFeeRate(e.target.value)}
					label="Fee Rate"
					value={feeRate}
					variant="outlined"
				/>
				<Typography
					style={{ justifySelf: "start" }}
					variant="body2"
					gutterBottom
				>
					Your total fee will be: 2.5$ (0.0001 BTC)
				</Typography>
				<Button
					variant="contained"
					style={{
						backgroundColor: "black",
						color: "orange",
						fontWeight: "bold",
						fontSize: "1.1em",
						width: "100%",
					}}
					onClick={() =>
						send_onchain_transaction(address, parseInt(amount))
					}
				>
					send
				</Button>
			</div>
		</div>
		</>
	);
}

export default Send;
