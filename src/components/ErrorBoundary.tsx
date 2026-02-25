import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import i18n from "i18next";

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
        <div className="flex flex-col items-center justify-center h-screen bg-[var(--color-bg)] text-[var(--color-text)] gap-4 p-8">
          <h1 className="text-xl font-bold text-[var(--color-danger-hover)]">{i18n.t("error.title")}</h1>
          <pre className="text-sm text-[var(--color-text-dim)] bg-[var(--color-bg-card)] p-4 rounded max-w-[600px] overflow-auto">
            {this.state.error?.message}
            {"\n"}
            {this.state.error?.stack}
          </pre>
          <button
            className="px-4 py-2 bg-[var(--color-accent)] rounded hover:bg-[var(--color-accent-light)] text-sm"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            {i18n.t("error.retry")}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
