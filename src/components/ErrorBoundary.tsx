import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0f] text-slate-200 gap-4 p-8">
          <h1 className="text-xl font-bold text-red-400">Something went wrong</h1>
          <pre className="text-sm text-slate-400 bg-[#12121a] p-4 rounded max-w-[600px] overflow-auto">
            {this.state.error?.message}
            {"\n"}
            {this.state.error?.stack}
          </pre>
          <button
            className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500 text-sm"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
