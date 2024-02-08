import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { NodeContextProvider } from "./NodeContext";

ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
).render(
  <React.StrictMode>
    <NodeContextProvider>
      <App />
    </NodeContextProvider>
  </React.StrictMode>
);
