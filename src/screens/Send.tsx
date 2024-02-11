import axios from "axios";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { Button, TextField, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useRouterContext } from "../router";
import SummarySend from "./SummarySend";

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
	const [feeRate, setFeeRate] = useState(1);
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
					<TextField
						id="outlined-basic"
						onChange={(e) => setFeeRate(Number(e.target.value))}
						label="Fee Rate"
						value={feeRate}
						variant="outlined"
					/>
					<Typography
						style={{ justifySelf: "start" }}
						variant="body2"
						gutterBottom
					>
						{`Economy Fee: ${reccomendedFee.economyFee}`}
					</Typography>
					<Typography
						style={{ justifySelf: "start" }}
						variant="body2"
						gutterBottom
					>
						{`Fastest Fee: ${reccomendedFee.fastestFee}`}
					</Typography>
					<Typography
						style={{ justifySelf: "start" }}
						variant="body2"
						gutterBottom
					>
						{`Half Hour Fee: ${reccomendedFee.halfHourFee}`}
					</Typography>
					<Typography
						style={{ justifySelf: "start" }}
						variant="body2"
						gutterBottom
					>
						{`Hour Fee: ${reccomendedFee.hourFee}`}
					</Typography>
					{`Minimum Fee: ${reccomendedFee.minimumFee}`}
					<Typography
						style={{ justifySelf: "start" }}
						variant="body2"
						gutterBottom
					></Typography>
					<Typography
						style={{ justifySelf: "start" }}
						variant="body2"
						gutterBottom
					>
						Your total fee will be: 2.5$ (0.0001 BTC)
					</Typography>
					<Button
						variant="contained"
						disabled={address === "" || amount === ""}
						style={{
							// backgroundColor: "inherit",
							// color: "orange",
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
