import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-400 text-xs uppercase tracking-widest font-light">Verifying Authorization...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6 text-center">
        <div className="max-w-md w-full p-8 border border-neutral-800 rounded-3xl bg-neutral-900/30 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="w-16 h-16 rounded-full bg-red-950/20 border border-red-500/20 flex items-center justify-center mx-auto mb-6 text-red-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif text-white mb-2">Access Denied</h2>
          <p className="text-neutral-400 text-sm font-light mb-8 leading-relaxed">
            This space is reserved for L'Essence Administrators. You must sign in with an administrator account to access this page.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/login" className="px-6 py-3.5 bg-[#C9A84C] text-black text-xs uppercase tracking-widest font-medium hover:bg-[#b0913b] transition duration-300">
              Sign In as Admin
            </Link>
            <Link to="/" className="text-xs uppercase tracking-widest text-neutral-500 hover:text-white transition duration-300 py-2">
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
