// Key feature: Mounts the React app once and wires global providers.
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

const rootElement = document.getElementById("root");

// Reuse the same root during dev hot reloads so the app does not duplicate on screen.
globalThis.__aidelaRoot ??= createRoot(rootElement);

globalThis.__aidelaRoot.render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);
