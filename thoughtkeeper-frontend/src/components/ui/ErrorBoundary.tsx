import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';

/**
 * ErrorBoundary - Global error boundary with fallback UI
 * 
 * Features:
 * - Catches JavaScript errors anywhere in the child component tree
 * - Displays fallback UI with error details
 * - Provides reset functionality to retry
 * - Logs errors for debugging (can be extended with error reporting)
 * - Responsive design with proper spacing
 * - User-friendly error messages
 */

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Here you could send the error to an error reporting service
    // Example: Sentry.captureException(error, { contexts: { errorInfo } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-text-secondary mb-6">
                We're sorry, but something unexpected happened. Don't worry, your data is safe.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={this.handleReset}
                variant="primary"
                size="lg"
                icon={<RefreshCw />}
                className="w-full"
              >
                Try Again
              </Button>
              
              <Button
                onClick={() => window.location.href = '/'}
                variant="secondary"
                size="lg"
                icon={<Home />}
                className="w-full"
              >
                Go Home
              </Button>
            </div>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-text-secondary hover:text-text-primary">
                  Technical Details
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono text-red-600 overflow-auto max-h-40">
                  <p className="font-bold mb-2">Error:</p>
                  <p className="mb-2">{this.state.error.message}</p>
                  
                  {this.state.error.stack && (
                    <>
                      <p className="font-bold mb-2">Stack Trace:</p>
                      <pre className="whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </>
                  )}
                  
                  {this.state.errorInfo && (
                    <>
                      <p className="font-bold mb-2 mt-4">Component Stack:</p>
                      <pre className="whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
