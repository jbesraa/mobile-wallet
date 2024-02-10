import "../App.css";
import { useNodeContext } from "../NodeContext";
import { useEffect, useState } from "react";

function Receive() {
	const { get_onchain_address } = useNodeContext();
	const [address, setAddress] = useState("");

	useEffect(() => {
		const handler = async () => {
				const onchain_address = await get_onchain_address();
				setAddress(onchain_address);
		};
		handler();
	}, []);


	return (
		<div className="container">
			<div style={{ padding: "1em" }}>
				<input
					disabled={true}
					value={address}
					style={{ width: "100%" }}
				/>
			</div>
		</div>
	);
}

export default Receive;

