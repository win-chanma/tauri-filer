import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppLayout } from "./components/AppLayout";

function App() {
  return (
    <ErrorBoundary>
      <AppLayout />
    </ErrorBoundary>
  );
}

export default App;
