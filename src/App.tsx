import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppLayout } from "./components/AppLayout";

function App() {
  useEffect(() => {
    try {
      getCurrentWindow().show().catch(() => {});
    } catch {
      // not in Tauri context (e.g. Playwright tests)
    }
  }, []);

  return (
    <ErrorBoundary>
      <AppLayout />
    </ErrorBoundary>
  );
}

export default App;
