import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, Home, ShieldAlert } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error in React Component:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReload = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  private handleGoHome = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      // ignore
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-slate-900/60 rounded-2xl border border-red-900/40 my-6">
          <div className="max-w-xl w-full bg-slate-900 border border-red-500/30 shadow-2xl rounded-2xl p-6 sm:p-8 text-center">
            <div className="w-14 h-14 bg-red-950/80 border border-red-500/40 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-950/50">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-slate-100 mb-2">
              {this.props.fallbackTitle || 'Terjadi Kendala Tampilan'}
            </h2>

            <p className="text-sm text-slate-400 mb-5 leading-relaxed">
              Komponen aplikasi mengalami kendala saat memuat data. Tenang, seluruh data tersimpan Anda tetap aman di sistem.
            </p>

            {this.state.error && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-left mb-6 overflow-x-auto max-h-32 text-xs font-mono text-red-400">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Muat Ulang Halaman
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
