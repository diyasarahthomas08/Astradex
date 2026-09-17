import React from 'react';
import '../styles.css';

export function SkeletonLoader({ width = '100%', height = 24, style = {}, className = '' }) {
  return (
    <div
      className={`skeleton-loader shimmer ${className}`}
      style={{ width, height, borderRadius: 8, ...style }}
      aria-busy="true"
      aria-label="Loading..."
    />
  );
}

export function EmptyState({ message = 'No data found.', icon = '📭', style = {} }) {
  return (
    <div className="empty-state" style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8', ...style }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{message}</div>
    </div>
  );
}

export function AnimatedCounter({ value, duration = 1200, isVisible = true, className = '', style = {} }) {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    if (!isVisible) {
      setCount(0);
      return;
    }
    let start = 0;
    const end = Number(value);
    if (start === end) return;
    const increment = Math.ceil(end / (duration / 30));
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [value, duration, isVisible]);
  return <span className={className} style={style}>{count}</span>;
}
