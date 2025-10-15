import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    console.error('Error Boundary caught an error:', error, errorInfo);

    // In production, send to error monitoring service like Sentry
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { errorInfo } });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-3xl shadow-2xl border border-red-200 overflow-hidden">
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Oups ! Une erreur est survenue
                </h1>

                <p className="text-gray-600 mb-6">
                  Nous sommes désolés, quelque chose s'est mal passé. Veuillez
                  réessayer ou contacter le support si le problème persiste.
                </p>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mb-6 text-left">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                      Détails de l'erreur (mode développement)
                    </summary>
                    <div className="mt-3 p-4 bg-red-50 rounded-lg border border-red-200">
                      <pre className="text-xs text-red-800 overflow-auto whitespace-pre-wrap">
                        {this.state.error.toString()}
                        {this.state.errorInfo?.componentStack}
                      </pre>
                    </div>
                  </details>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={this.handleRetry}
                    className="flex-1 btn btn-primary"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Réessayer
                  </button>

                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 btn btn-secondary"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Accueil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
