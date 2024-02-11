import * as React from "react";
import { useNodeContext } from "../NodeContext";
import { useState } from "react";
import { useRouterContext } from "../router";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { Button, TextField } from "@mui/material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";

const LightningReceive = () => {
	const { create_invoice } = useNodeContext();
	const [amount, setAmount] = useState("");
	return (
		<>
			<TextField
				id="outlined-basic"
				onChange={(e) => setAmount(e.target.value)}
				label="Amount (sats)"
				value={amount}
				variant="outlined"
			/>
			<Button
				variant="contained"
				style={{
					backgroundColor: "black",
					color: "orange",
					fontWeight: "bold",
					fontSize: "1.1em",
					width: "100%",
				}}
				onClick={() => create_invoice(Number(amount), "")}
			>
				Create Invoice
			</Button>
		</>
	);
};

const OnchainReceive = () => {
	return (
		<>
			<TextField
				id="outlined-basic"
				label="Onchain Receive Address"
				disabled={true}
				value={"b1c"}
				variant="outlined"
			/>
		</>
	);
};

function Receive() {
	const { push_route } = useRouterContext();
	const [value, setValue] = React.useState(0);
	const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	return (
		<div className="container">
			<div style={{ display: "grid", padding: "1em", gap: "1em" }}>
				<div style={{ justifySelf: "start" }}>
					<ArrowBackOutlinedIcon onClick={() => push_route("home")} />
				</div>
				<Tabs variant="fullWidth" value={value} onChange={handleChange}>
					<Tab icon={<ElectricBoltIcon />} />
					<Tab icon={<CurrencyBitcoinIcon />} />
				</Tabs>
				{value === 0 && <LightningReceive />}
				{value === 1 && <OnchainReceive />}
			</div>
		</div>
	);
}

export default Receive;
