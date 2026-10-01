import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#111111] border border-white/[0.09] rounded-xl p-8 text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="p-3 bg-rose-500/10 rounded-lg border border-rose-500/20 text-rose-400 w-fit mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Component Render Error</h2>
            <p className="text-xs text-slate-400 mt-1">
              A temporary UI error occurred in this view section.
            </p>
          </div>

          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#D7FF3F] hover:bg-[#B8E638] text-[#050505] font-semibold text-xs rounded-md transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Component</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
