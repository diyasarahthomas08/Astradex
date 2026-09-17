import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute
 * @param {string} allowedRole - "student" | "staff" | "admin"
 * @param {React.ReactNode} children
 */
export default function ProtectedRoute({ allowedRole, children }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '1.1rem',
        color: 'var(--text-secondary, #64748b)',
        fontFamily: 'Inter, sans-serif',
      }}>
        <span style={{ marginRight: '0.75rem', fontSize: '1.5rem' }}>⏳</span>
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
