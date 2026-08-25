import { Component } from 'react';

/**
 * Catches render errors in its subtree instead of letting them unmount the
 * whole app to a blank white screen (React's default behavior with no
 * boundary in place). Pass `resetKey` (e.g. the current route) so the
 * boundary automatically recovers when the user navigates away, instead of
 * requiring a manual reload.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Nexa render error:', error, info);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24 px-6 text-center">
            <h2 className="text-lg font-semibold text-text-primary">Something went wrong</h2>
            <p className="text-sm text-text-muted max-w-sm">
              This part of the page hit an unexpected error. Try reloading, or head back to the homepage.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors"
              >
                Reload page
              </button>
              <a
                href="/"
                className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-text-primary hover:bg-surface-secondary transition-colors"
              >
                Go home
              </a>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
