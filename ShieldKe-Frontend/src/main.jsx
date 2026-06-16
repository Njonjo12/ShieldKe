import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

/* ── Base (Tailwind + CSS variables) ── */
import "./index.css";

/* ── Component styles ── */
import "./styles/global.css";
import "./styles/navbar.css";
import "./styles/home.css";
import "./styles/dashboard.css";
import "./styles/admin.css";
import "./styles/auth.css";
import "./styles/theme.css";
import "./styles/chat.css";
import "./styles/responsive.css";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
