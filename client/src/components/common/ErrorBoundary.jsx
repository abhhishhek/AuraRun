import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {}

  render() {
    if (this.state.hasError) {
      return (
        <div className="section">
          <div className="container flex-center" style={{ flexDirection: "column", gap: "12px", minHeight: "300px" }}>
            <h2 style={{ fontSize: "1.6rem" }}>Something went wrong</h2>
            <p style={{ color: "var(--text-muted)" }}>Please refresh the page or try again later.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
