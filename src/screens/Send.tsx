import * as React from "react";
import { useNodeContext } from "../NodeContext";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import QRCode from "react-qr-code";
import axios from "axios";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { Button, TextField, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useRouterContext } from "../router";
import SummarySend from "./SummarySend";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

function valuetext(value: number) {
	return `${value} sat/vb`;
}

function FeeSlider(props: any) {
	const { marks, min, max } = props;
	return (
		<>
			<Typography
				variant="subtitle2"
				style={{
					color: "gray",
					justifySelf: "left",
					textAlign: "left",
				}}
			>
				Fee Rate (sat/vb)
			</Typography>
			<Box style={{ padding: "0.4em", paddingTop: 0 }}>
				<Slider
					valueLabelDisplay="auto"
					name="Fee Rate"
					onChange={(_, value) => props.onChange(value)}
					defaultValue={marks[0].value}
					valueLabelFormat={valuetext}
					min={min}
					max={max}
					marks={marks}
				/>
			</Box>
		</>
	);
}

interface ReccomndedFee {
	economyFee: number;
	fastestFee: number;
	halfHourFee: number;
	hourFee: number;
	minimumFee: number;
}

const LightningSend = () => {
	const { decode_invoice } = useNodeContext();
	const [invoice, setInvoice] = useState("");
	const [decodedAmount, setDecodedAmount] = useState(0);
	const [decodedDesc, setDecodedDesc] = useState("");

	useEffect(() => {
		if (invoice === "") return;
		const handler = async () => {
			const decoded = await decode_invoice(invoice);
			setDecodedAmount(decoded[1]);
			setDecodedDesc(decoded[0]);
			console.log(decoded);
		};
		handler();
	}, [invoice]);

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
				onChange={(e) => setInvoice(e.target.value)}
				label="Amount (sats)"
				value={invoice}
				variant="outlined"
			/>
			<Typography>
				{decodedAmount} sats - {decodedDesc}
			</Typography>
			<Button
				variant="contained"
				disabled={!invoice}
				style={{
					fontWeight: "bold",
					fontSize: "1.1em",
					width: "100%",
				}}
				onClick={async () => {}}
			>
				Continue
			</Button>
		</>
	);
};

const OnchainSend = () => {
	const [amount, setAmount] = useState("");
	const [reccomendedFee, setReccomendedFee] = useState<ReccomndedFee>(
		{} as ReccomndedFee
	);
	const [feeRate, setFeeRate] = useState(reccomendedFee.halfHourFee);
	const [address, setAddress] = useState("");
	const [showSummary, setShowSummary] = useState(false);

	useEffect(() => {
		const handler = async () => {
			let res = await axios.get(
				"https://mempool.space/api/v1/fees/recommended"
			);
			console.log(res);
			setReccomendedFee(res.data);
		};
		handler();
	}, []);

	if (showSummary) {
		return (
			<SummarySend
				address={address}
				amount={Number(amount)}
				feeRate={feeRate}
				onArrowBack={() => setShowSummary(false)}
			/>
		);
	}

	return (
		<div style={{ display: "grid", gap: "1em" }}>
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
			<FeeSlider
				onChange={(value: number) => setFeeRate(value)}
				min={reccomendedFee.hourFee}
				max={reccomendedFee.fastestFee}
				marks={[
					{
						value: reccomendedFee.fastestFee,
						label: "Fast",
					},
					{
						value: reccomendedFee.halfHourFee,
						label: reccomendedFee.halfHourFee,
					},
					{
						value: reccomendedFee.hourFee,
						label: "Slow",
					},
				]}
			/>
			<Typography style={{ justifySelf: "start" }} variant="subtitle2">
				Fee: {feeRate} sat/vb
			</Typography>
			<Typography style={{ justifySelf: "start" }} variant="subtitle2">
				Your total fee will be: 2.5$ (0.0001 BTC)
			</Typography>
			<Button
				variant="contained"
				disabled={address === "" || amount === "" || !feeRate}
				style={{
					fontWeight: "bold",
					fontSize: "1.1em",
					width: "100%",
				}}
				onClick={() => setShowSummary(true)}
			>
				Continue
			</Button>
		</div>
	);
};

function Send() {
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
				{value === 0 && <LightningSend />}
				{value === 1 && <OnchainSend />}
			</div>
		</div>
	);
}

export default Send;
