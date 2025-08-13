import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ChatPage = lazy(() => import('@/pages/ChatPage').then(m => ({ default: m.ChatPage })));
const TasksPage = lazy(() => import('@/pages/TasksPage').then(m => ({ default: m.TasksPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const HealthPage = lazy(() => import('@/pages/HealthPage').then(m => ({ default: m.HealthPage })));
const NotFound = lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })));
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { UpdateNotification } from '@/components/UpdateNotification';
import { initializeAccessibility } from '@/lib/accessibility';
import { accessibilityTester } from '@/lib/accessibility-testing';

function App() {
  // Initialize accessibility features when the app loads
  useEffect(() => {
    initializeAccessibility();

    // Run initial accessibility audit in development
    if (import.meta.env.DEV) {
      setTimeout(async () => {
        try {
          const result = await accessibilityTester.auditPage();
          console.log('Initial accessibility audit completed:', {
            score: result.score,
            violations: result.violations.length,
            passes: result.passes.length,
          });

          if (result.violations.length > 0) {
            console.warn('Accessibility violations found:', result.violations);
          }
        } catch (error) {
          console.warn('Initial accessibility audit failed:', error);
        }
      }, 2000); // Wait 2 seconds for page to fully load
    }
  }, []);

  return (
    <ErrorBoundary>
      <div id="main-content">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes with layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ChatPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TasksPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/health"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <HealthPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Default redirect to chat (main interface) */}
          <Route path="/" element={<Navigate to="/chat" replace />} />

          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        {/* PWA Install Prompt - shows globally when installable */}
        <InstallPrompt />
        
        {/* Auto-Deployment Notifications - shows globally for real-time updates */}
        <UpdateNotification websocketUrl={import.meta.env.VITE_WEBHOOK_WEBSOCKET_URL} />
      </div>
    </ErrorBoundary>
  );
}

export default App;
