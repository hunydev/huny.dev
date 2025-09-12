import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Dynamic viewport height calculation for mobile browsers
if (typeof window !== 'undefined') {
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
