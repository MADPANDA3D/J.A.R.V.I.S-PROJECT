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
import { centralizedLogging } from '@/lib/centralizedLogging';
import { getLoggingConfig, validateLoggingConfig, testLoggingConfiguration } from '@/config/logging';
import { ensureAccessibilityInitialized } from '@/lib/accessibility';

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        console.log('✅ SW registered: ', registration);

        // Handle service worker updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
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

// Initialize centralized logging
const initializeLogging = async () => {
  try {
    const loggingConfig = getLoggingConfig();
    const validation = validateLoggingConfig(loggingConfig);
    
    if (!validation.valid) {
      console.error('❌ Logging configuration errors:', validation.errors);
      validation.warnings.forEach(warning => console.warn(`⚠️ ${warning}`));
    } else {
      // Update centralized logging configuration
      centralizedLogging.updateConfig(loggingConfig);
      
      // Test logging configuration in development
      if (import.meta.env.DEV) {
        console.log('🧪 Testing logging configuration...');
        const testResult = await testLoggingConfiguration();
        
        if (testResult.success) {
          console.log('✅ All logging destinations are working');
        } else {
          console.warn('⚠️ Some logging destinations failed:', 
            testResult.results.filter(r => !r.success)
          );
        }
      }

      // Log application startup
      centralizedLogging.info(
        'jarvis-chat',
        'system',
        'Application starting up',
        {
          environment: import.meta.env.MODE,
          version: import.meta.env.VITE_APP_VERSION,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      );
    }
  } catch (error) {
    console.error('❌ Failed to initialize logging:', error);
  }
};

// Initialize logging
initializeLogging();

// Validate environment variables on startup
const envResult = validateEnvironment();
logEnvironmentStatus(envResult);

// Show critical errors in development
if (!envResult.isValid && import.meta.env.DEV) {
  console.error('❌ Critical environment configuration errors detected:');
  envResult.errors.forEach(error => console.error(`  • ${error}`));
}

// Ensure page loads at the top and initialize accessibility
window.addEventListener("load", () => {
  window.scrollTo(0, 0);
  // Initialize accessibility features after DOM is fully loaded
  ensureAccessibilityInitialized();
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
