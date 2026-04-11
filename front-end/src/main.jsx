// main.jsx — ajouter TripContextProvider
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext.jsx";
import { TripContextProvider } from "./context/TripContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthContextProvider>
      <TripContextProvider>
        <App />
      </TripContextProvider>
    </AuthContextProvider>
  </BrowserRouter>
);
