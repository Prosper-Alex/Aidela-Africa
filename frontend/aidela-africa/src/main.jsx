import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

const rootElement = document.getElementById("root");

globalThis.__aidelaRoot ??= createRoot(rootElement);

globalThis.__aidelaRoot.render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);
