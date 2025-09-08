import React from "react"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("❌ Erreur capturée par ErrorBoundary:", error, errorInfo)
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "1rem", border: "1px solid red" }}>
          <h4 style={{ color: "red" }}>⚠️ Une erreur est survenue :</h4>
          <pre>{this.state.error?.toString()}</pre>
          <details style={{ whiteSpace: "pre-wrap" }}>
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
