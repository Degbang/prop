import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* basename must match vite base and GitHub Pages path */}
    <BrowserRouter basename="/prop">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
