import React, { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';

export default function SupabaseConnectionTest() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'connected' | 'failed'

  useEffect(() => {
    async function checkConnection() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[SupabaseConnectionTest] getSession error:', error);
          setStatus('failed');
        } else {
          console.log('[SupabaseConnectionTest] getSession succeeded:', data);
          setStatus('connected');
        }
      } catch (err) {
        console.error('[SupabaseConnectionTest] Unexpected error:', err);
        setStatus('failed');
      }
    }

    checkConnection();
  }, []);

  const styles = {
    wrapper: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 14px',
      borderRadius: '999px',
      fontSize: '13px',
      fontWeight: 600,
      fontFamily: 'monospace',
      margin: '8px 0',
      border: '1px solid',
      ...(status === 'connected' && {
        background: 'rgba(34, 197, 94, 0.1)',
        color: '#16a34a',
        borderColor: 'rgba(34, 197, 94, 0.3)',
      }),
      ...(status === 'failed' && {
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#dc2626',
        borderColor: 'rgba(239, 68, 68, 0.3)',
      }),
      ...(status === 'checking' && {
        background: 'rgba(148, 163, 184, 0.1)',
        color: '#64748b',
        borderColor: 'rgba(148, 163, 184, 0.3)',
      }),
    },
    dot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: 'currentColor',
    },
  };

  const label =
    status === 'connected'
      ? 'Supabase: Connected'
      : status === 'failed'
      ? 'Supabase: Connection failed'
      : 'Supabase: Checking…';

  return (
    <div style={{ padding: '4px 16px' }}>
      <div style={styles.wrapper}>
        <span style={styles.dot} />
        {label}
      </div>
    </div>
  );
}
