// Key feature: Catches unexpected React render errors and shows recovery UI.
import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ERROR BOUNDARY] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="rounded-lg bg-white p-8 shadow-lg">
            <h1 className="text-2xl font-bold text-red-600">
              Something went wrong
            </h1>
            <p className="mt-2 text-slate-600">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-primary px-6 py-2 text-white hover:bg-primary-accent">
              Reload page
            </button>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-slate-500">
                Error details
              </summary>
              <pre className="mt-2 overflow-auto rounded bg-slate-100 p-4 text-xs">
                {this.state.error?.stack}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
