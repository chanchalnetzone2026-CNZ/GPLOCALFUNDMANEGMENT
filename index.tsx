
import React, { Component, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { pruneLocalStorage, clearExcessStorage } from './lib/storage';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Captured by ErrorBoundary:', error, errorInfo);
    if (
      error?.name === 'QuotaExceededError' ||
      (typeof error?.message === 'string' && error.message.toLowerCase().includes('quota'))
    ) {
      console.warn('Quota exceeded detected in ErrorBoundary. Pruning storage cache...');
      pruneLocalStorage();
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleClearCacheAndReload = () => {
    clearExcessStorage();
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isQuota =
        this.state.error?.name === 'QuotaExceededError' ||
        (typeof this.state.error?.message === 'string' &&
          this.state.error.message.toLowerCase().includes('quota'));

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-900">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {isQuota ? 'ब्राउज़र स्टोरेज सीमा पार / Storage Quota Exceeded' : 'त्रुटि हुई / An unexpected error occurred'}
            </h2>
            <p className="text-xs text-slate-600">
              {isQuota
                ? 'ब्राउज़र लोकल स्टोरेज कोटा भर जाने के कारण त्रुटि आई। नीचे दिए गए बटन से कैशे खाली करें।'
                : this.state.error?.message || 'एप्लिकेशन को पुनः लोड करने का प्रयास करें।'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              {isQuota && (
                <button
                  type="button"
                  onClick={this.handleClearCacheAndReload}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  🧹 कैशे साफ़ कर पुनः लोड करें / Clear Cache & Reload
                </button>
              )}
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                🔄 पृष्ठ पुनः लोड करें / Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

