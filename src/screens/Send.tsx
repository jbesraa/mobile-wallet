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

function Send() {
	const { push_route } = useRouterContext();
	const [amount, setAmount] = useState("");
	const [feeRate, setFeeRate] = useState();
	const [address, setAddress] = useState("");
	const [reccomendedFee, setReccomendedFee] = useState<ReccomndedFee>(
		{} as ReccomndedFee
	);
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
		<>
			<div className="container">
				<div style={{ display: "grid", padding: "1em", gap: "1em" }}>
					<div style={{ justifySelf: "start" }}>
						<ArrowBackOutlinedIcon
							onClick={() => push_route("home")}
						/>
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
					<Typography
						style={{ justifySelf: "start" }}
						variant="subtitle2"
					>
						Fee: {feeRate} sat/vb
					</Typography>
					<Typography
						style={{ justifySelf: "start" }}
						variant="subtitle2"
					>
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
			</div>
		</>
	);
}

export default Send;
