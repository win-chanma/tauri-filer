import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppLayout } from "./components/AppLayout";

function App() {
  useEffect(() => {
    getCurrentWindow().show();
  }, []);

  return (
    <ErrorBoundary>
      <AppLayout />
    </ErrorBoundary>
  );
}

export default App;
