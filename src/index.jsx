import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./i18n"; // Initialize i18n
import App from "./App";
import { BasketProvider } from "./contexts/BasketContext";
import { UniversityProvider } from "./contexts/UniversityContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <UniversityProvider>
      <BasketProvider>
        <App />
      </BasketProvider>
    </UniversityProvider>
  </React.StrictMode>
);
