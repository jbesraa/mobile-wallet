import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import { invoke } from "@tauri-apps/api/core";

export interface SimpleDialogProps {
	open: boolean;
	selectedValue: string;
	onClose: (value: string) => void;
	walletName: string;
}

function ConnectDialog(props: SimpleDialogProps) {
	const { onClose, selectedValue, open } = props;
	const [message, setMessage] = useState("");
	const [token, setToken] = useState("");

	async function connect() {
		try {
			let res: boolean = await invoke("save_token", {
				token,
			});

			if (res) {
				setMessage("Successfully Connected");
			}
		} catch (e) {
			console.log(e);
			setMessage(String(e));
		}
	}

	const title = "Create Account";

	const handleClose = () => {
		onClose(selectedValue);
	};

	useEffect(() => {
		return () => {
			setMessage("")
			setToken("")
		}
	},[])

	return (
		<Dialog
			fullWidth={true}
			maxWidth="lg"
			onClose={handleClose}
			open={open}
		>
			<DialogTitle sx={{ textAlign: "center" }}>{title}</DialogTitle>
			<List sx={{ p: 6 }}>
				<ListItem disableGutters>
					<TextField
						style={{ width: "100%" }}
						label={"Token"}
						value={token}
						onChange={(e) => setToken(e.target.value)}
					/>
				</ListItem>
				{message && (
					<ListItem disableGutters>
						<TextField
							disabled={true}
							style={{ width: "100%" }}
							label={"Message"}
							value={message}
						/>
					</ListItem>
				)}
				<ListItem disableGutters>
					<button onClick={connect} style={{ width: "100%" }}>
						send
					</button>
				</ListItem>
			</List>
		</Dialog>
	);
}

export default ConnectDialog;

//
// - Create Account
//   - Through the Desktop APP
// - Create BOLT12 Offer with Account Name as Description
//   - Create JWT for the account
//
// - Receive Payment
// - Send Payment
// - List Transactions
//
//
//
//
//
