import * as React from "react";
import { useNodeContext } from "../NodeContext";
import { useState } from "react";
import { useRouterContext } from "../router";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { Button, TextField, Typography } from "@mui/material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import QRCode from "react-qr-code";

const LightningReceive = () => {
	const { create_invoice } = useNodeContext();
	const [amount, setAmount] = useState("");
	const [invoice, setInvoice] = useState("");

	return (
		<>
			<QRCode
				style={{
					width: "100%",
					height: "100%",
					display: invoice ? "inherit" : "none",
				}}
				value={invoice}
			/>
			<TextField
				id="outlined-basic"
				disabled={invoice !== ""}
				onChange={(e) => setAmount(e.target.value)}
				label="Amount (sats)"
				value={amount}
				variant="outlined"
			/>
			<Typography>
				{invoice ? invoice.slice(0, 10) + "..." + invoice.slice(-10, 10) : ""}
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
				onClick={async () => {
					const inv = await create_invoice(Number(amount), "");
					setInvoice(inv);
				}}
			>
				Create Invoice
			</Button>
		</>
	);
};

interface OnchainReceiveProps {
	address: string;
}

const OnchainReceive = (props: OnchainReceiveProps) => {
	const { address } = props;

	return (
		<>
			<QRCode style={{ width: "100%", height: "100%" }} value={address} />
			<Typography>{address}</Typography>
		</>
	);
};

function Receive() {
	const { push_route } = useRouterContext();
	const [value, setValue] = React.useState(0);
	const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};
	const [address, setAddress] = useState("");
	const { get_onchain_address } = useNodeContext();

	React.useEffect(() => {
		const handler = async () => {
			const onchain_address = await get_onchain_address();
			setAddress(onchain_address);
		};
		handler();
	}, []);

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
				{value === 1 && <OnchainReceive address={address} />}
			</div>
		</div>
	);
}

export default Receive;
