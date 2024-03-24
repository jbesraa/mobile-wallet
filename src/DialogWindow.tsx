import { useState } from "react";
import { IconButton } from "@mui/material";
import ConnectWithoutContact from "@mui/icons-material/ConnectWithoutContact";

function DialogWindow({
	DialogView,
	onCloseHandler,
	extraProps,
}: {
	DialogView: any;
	onCloseHandler?: any;
	extraProps?: any;
}) {
	const [open, setOpen] = useState(false);
	const handleClickOpen = () => {
		setOpen(true);
	};
	const handleClose = () => {
		onCloseHandler && onCloseHandler();
		setOpen(false);
	};

	return (
		<>
			<IconButton onClick={handleClickOpen}><ConnectWithoutContact/></IconButton>
			<DialogView open={open} onClose={handleClose} {...extraProps} />
		</>
	);
}

export default DialogWindow;
