import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useIdleTimeout } from '../hooks/useIdleTimeout';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const { showWarning } = useIdleTimeout();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sk-body-bg">
        <div className="w-12 h-12 border-4 border-sk-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      {children}
      {showWarning && (
        <div className="fixed bottom-4 right-4 z-[9999] bg-sk-navy text-white px-4 py-3 rounded-sk-lg shadow-lg text-sm max-w-xs">
          You&apos;ll be signed out in 5 minutes due to inactivity.
        </div>
      )}
    </>
  );
}
