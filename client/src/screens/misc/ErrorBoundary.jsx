import React from "react";
import Error from "./Error.jsx";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    /*
    componentDidCatch(error, errorInfo) {
        // Suppress console.error during error boundary fallback rendering
        if (import.meta.env.MODE === 'production') {
            console.error = () => {};
        }
    }
    */

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <Error />;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;