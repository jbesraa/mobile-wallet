import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { Button, TextField, Typography } from "@mui/material";
import { useNodeContext } from "../NodeContext";

interface SummarySendProps {
	address: string;
	amount: number;
	feeRate: number;
	onArrowBack: () => void;
}

function SummarySend(props: SummarySendProps) {
	const { address, amount, feeRate, onArrowBack } = props;
	const { send_onchain_transaction } = useNodeContext();

	return (
		<>
			<div className="container">
				<div style={{ display: "grid", padding: "1em", gap: "1em" }}>
					<div style={{ justifySelf: "start" }}>
					<ArrowBackOutlinedIcon onClick={onArrowBack} />
				</div>
				<TextField
					id="outlined-basic"
					disabled={true}
					label="Address"
					value={address}
					variant="outlined"
				/>
				<TextField
					id="outlined-basic"
					disabled={true}
					label="Amount"
					value={amount}
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
						backgroundColor: "inherit",
						color: "orange",
						fontWeight: "bold",
						fontSize: "1.1em",
						width: "100%",
					}}
					onClick={() =>
						send_onchain_transaction(address, amount, feeRate)
					}
				>
					Send
				</Button>
			</div>
			</div>
		</>
	);
}

export default SummarySend;
