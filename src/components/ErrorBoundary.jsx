/**
 * ErrorBoundary.jsx - React Error Boundary
 * 
 * Catches render errors and shows graceful fallback UI.
 * Prevents entire app from crashing on component errors.
 */

import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Silent error handling - no console logs in production
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return typeof this.props.fallback === 'function'
                    ? this.props.fallback({ error: this.state.error, retry: this.handleRetry })
                    : this.props.fallback;
            }

            // Default minimal fallback
            return (
                <div className="error-boundary-fallback">
                    <div className="error-boundary-content">
                        <div className="error-boundary-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        {this.props.showMessage !== false && (
                            <p className="error-boundary-message">
                                {this.props.message || 'Something went wrong'}
                            </p>
                        )}
                        {this.props.showRetry !== false && (
                            <button
                                className="error-boundary-retry"
                                onClick={this.handleRetry}
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                    <style>{`
                        .error-boundary-fallback {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-height: 120px;
                            padding: 24px;
                            background: var(--bg-card, #fff);
                            border: 1px solid var(--border, #e5e7eb);
                            border-radius: 12px;
                        }
                        .error-boundary-content {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 12px;
                            text-align: center;
                        }
                        .error-boundary-icon {
                            width: 32px;
                            height: 32px;
                            color: var(--text-muted, #9ca3af);
                        }
                        .error-boundary-icon svg {
                            width: 100%;
                            height: 100%;
                        }
                        .error-boundary-message {
                            font-size: 14px;
                            color: var(--text-muted, #6b7280);
                            margin: 0;
                        }
                        .error-boundary-retry {
                            padding: 8px 16px;
                            font-size: 13px;
                            font-weight: 500;
                            color: var(--accent, #6366f1);
                            background: transparent;
                            border: 1px solid var(--accent, #6366f1);
                            border-radius: 6px;
                            cursor: pointer;
                            transition: all 0.2s ease;
                        }
                        .error-boundary-retry:hover {
                            background: var(--accent, #6366f1);
                            color: white;
                        }
                    `}</style>
                </div>
            );
        }

        return this.props.children;
    }
}

// Functional wrapper for easier usage
export function withErrorBoundary(Component, options = {}) {
    return function WrappedComponent(props) {
        return (
            <ErrorBoundary {...options}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}

export default ErrorBoundary;
