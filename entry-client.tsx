import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Dynamic viewport height calculation for mobile browsers
if (typeof window !== 'undefined') {
  // Attach encrypted API key cipher to all same-origin /api requests
  try {
    const origFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      try {
        let urlStr = '';
        if (typeof input === 'string') urlStr = input;
        else if (input instanceof URL) urlStr = input.toString();
        else if (input && typeof (input as Request).url === 'string') urlStr = (input as Request).url;
        const url = new URL(urlStr, window.location.href);
        const isSameOrigin = url.origin === window.location.origin;
        const isApi = url.pathname.startsWith('/api/');
        if (!(isSameOrigin && isApi)) {
          return origFetch(input as any, init);
        }
        const cipher = localStorage.getItem('secure.apikeys.v1') || '';
        if (!cipher) return origFetch(input as any, init);
        // Merge headers from Request and init, then add our header
        let merged = new Headers();
        if (input instanceof Request) {
          merged = new Headers(input.headers);
        }
        if (init && init.headers) {
          const add = new Headers(init.headers as any);
          add.forEach((v, k) => merged.set(k, v));
        }
        merged.set('X-ApiKey-Cipher', cipher);
        if (input instanceof Request) {
          const req = new Request(input, { headers: merged });
          return origFetch(req, init);
        }
        return origFetch(url.toString(), { ...(init || {}), headers: merged });
      } catch {
        return origFetch(input as any, init);
      }
    };
  } catch {}

  const setAppHeight = () => {
    // Use visualViewport for most accurate measurement on mobile
    const vh = window.visualViewport?.height ?? window.innerHeight;
    document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
    document.documentElement.style.setProperty('--app-height', `${vh}px`);
  };
  
  // Set initial height
  setAppHeight();
  
  // Update on resize and orientation change
  window.addEventListener('resize', setAppHeight);
  window.addEventListener('orientationchange', setAppHeight);
  
  // Visual viewport API for mobile browsers
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setAppHeight);
    window.visualViewport.addEventListener('scroll', setAppHeight);
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
