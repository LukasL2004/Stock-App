import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { MOCK_MODE } from "./lib/http";

async function boot() {
  if (MOCK_MODE) {
    const { installMockApi } = await import("./mocks/mockApi");
    installMockApi();
  }
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

boot();
