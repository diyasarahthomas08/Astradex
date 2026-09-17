import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from './context/ThemeContext';

// Progressive enhancement: mark that JS is enabled so CSS can apply reveal animations
if (typeof document !== 'undefined') {
  document.body.classList.add('js-enabled');
  // Surface any unexpected runtime errors directly into the DOM for quick diagnosis
  window.onerror = function (message, source, lineno, colno, error) {
    const existing = document.getElementById('runtime-error-overlay');
    if (existing) return;
    const div = document.createElement('div');
    div.id = 'runtime-error-overlay';
    div.style.cssText = 'position:fixed;z-index:99999;top:0;left:0;right:0;background:#300;padding:12px;color:#fff;font:12px/1.4 monospace;white-space:pre;max-height:50vh;overflow:auto;border-bottom:2px solid #900;';
    div.textContent = '[Runtime Error]\n' + message + '\n' + source + ':' + lineno + ':' + colno + (error && error.stack ? '\n' + error.stack : '');
    document.body.appendChild(div);
    document.body.classList.add('force-visible');
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
