import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from '@/contexts/AuthContext';
import {
  validateEnvironment,
  logEnvironmentStatus,
} from '@/lib/env-validation';
import '@/lib/errorTracking'; // Initialize error tracking

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('✅ SW registered: ', registration);

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // New service worker available, show update notification
                console.log('🔄 New service worker available');
                // TODO: Show user notification for update (future enhancement)
              }
            });
          }
        });
      })
      .catch(registrationError => {
        console.log('❌ SW registration failed: ', registrationError);
      });
  });
}

// Validate environment variables on startup
const envResult = validateEnvironment();
logEnvironmentStatus(envResult);

// Show critical errors in development
if (!envResult.isValid && import.meta.env.DEV) {
  console.error('❌ Critical environment configuration errors detected:');
  envResult.errors.forEach(error => console.error(`  • ${error}`));
}

// Ensure page loads at the top
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
