import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary] Caught error:', error)
  }

  render() {
    if (this.state.hasError) {
      const isConfigError = this.state.error?.message.includes('environment') || 
                            this.state.error?.message.includes('VITE_') ||
                            this.state.error?.message.includes('Supabase not initialized')

      return (
        <div className="min-h-screen bg-light flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-red-600 mb-2">
                  {isConfigError ? 'Configuration Error' : 'Application Error'}
                </h1>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm font-mono break-words">
                  {this.state.error?.message || 'An unknown error occurred'}
                </p>
              </div>

              {isConfigError && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-800 text-sm">
                    <strong>Fix:</strong> Please ensure your Supabase environment variables are properly configured:
                  </p>
                  <ul className="text-blue-800 text-sm mt-2 space-y-1 ml-4">
                    <li>• VITE_SUPABASE_URL</li>
                    <li>• VITE_SUPABASE_ANON_KEY</li>
                  </ul>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Reload Application
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Go Home
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Error details have been logged to the browser console.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
