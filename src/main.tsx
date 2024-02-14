import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { NodeContextProvider } from "./NodeContext";
import { RouterContextProvider } from "./router";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<RouterContextProvider>
			<NodeContextProvider>
				<App />
			</NodeContextProvider>
		</RouterContextProvider>
	</React.StrictMode>
);
