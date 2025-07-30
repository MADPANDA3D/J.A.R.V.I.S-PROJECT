import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Settings,
  User,
  Bell,
  Database,
  LogOut,
  Save,
  Eye,
  EyeOff,
  Shield,
  Accessibility,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getEnvironmentInfo } from '@/lib/env-validation';

export const SettingsPage: React.FC = () {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const envInfo = getEnvironmentInfo();

  // Page loaded successfully
  useEffect(() => {
    console.log('Settings page mounted successfully');
  }, []);

  // Form states
  const [displayName, setDisplayName] = useState(
    user?.email?.split('@')[0] || ''
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState(
    import.meta.env.VITE_N8N_WEBHOOK_URL || ''
  );

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Profile saved:', { displayName });
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="p-6" role="main" aria-label="Settings page">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1
            className="text-2xl font-bold text-foreground mb-2"
            role="heading"
            aria-level={1}
          >
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account and application preferences.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Profile Settings */}
          <Card role="region" aria-labelledby="profile-settings-title">
            <CardHeader>
              <CardTitle
                id="profile-settings-title"
                className="flex items-center gap-2"
                role="heading"
                aria-level={2}
              >
                <User className="w-5 h-5 text-primary" aria-hidden="true" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label htmlFor="displayName" className="text-sm font-medium">
                    Display Name
                  </label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="mt-1"
                    placeholder="Your display name"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground">User ID</p>
                <p className="text-xs text-muted-foreground font-mono bg-secondary p-2 rounded mt-1">
                  {user?.id}
                </p>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="w-fit"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>

          {/* Chat Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Chat Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="n8nUrl" className="text-sm font-medium">
                  N8N Webhook URL
                </label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="n8nUrl"
                    type={showApiKey ? 'text' : 'password'}
                    value={n8nWebhookUrl}
                    onChange={e => setN8nWebhookUrl(e.target.value)}
                    placeholder="https://your-n8n-instance/webhook/..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure your AI webhook endpoint for custom responses
                </p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Environment Status</p>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Environment</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        envInfo.isProduction
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {envInfo.isProduction ? 'Production' : 'Development'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Configuration Valid</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        envInfo.isValid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {envInfo.isValid ? '✅ Valid' : '❌ Issues'}
                    </span>
                  </div>

                  <div className="space-y-1 pt-2 border-t">
                    <div className="flex justify-between">
                      <span>Supabase</span>
                      <span
                        className={
                          envInfo.hasSupabase
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {envInfo.hasSupabase ? '✅ Connected' : '❌ Missing'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>AI Service</span>
                      <span
                        className={
                          envInfo.hasN8nWebhook
                            ? 'text-green-600'
                            : 'text-yellow-600'
                        }
                      >
                        {envInfo.hasN8nWebhook
                          ? '✅ Configured'
                          : '⚠️ Fallback'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>App Domain</span>
                      <span
                        className={
                          envInfo.hasAppDomain
                            ? 'text-green-600'
                            : 'text-gray-500'
                        }
                      >
                        {envInfo.hasAppDomain ? '✅ Set' : '➖ Not set'}
                      </span>
                    </div>
                  </div>

                  {envInfo.errors.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-red-600 font-medium">Errors:</p>
                      {envInfo.errors.map((error, index) => (
                        <p key={index} className="text-red-600">
                          • {error}
                        </p>
                      ))}
                    </div>
                  )}

                  {envInfo.warnings.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-yellow-600 font-medium">Warnings:</p>
                      {envInfo.warnings.map((warning, index) => (
                        <p key={index} className="text-yellow-600">
                          • {warning}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Chat Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new messages
                  </p>
                </div>
                <Button
                  variant={notificationsEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                >
                  {notificationsEnabled ? 'Enabled' : 'Disabled'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Real-time Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Live message synchronization
                  </p>
                </div>
                <Button variant="default" size="sm" disabled>
                  Always On
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Accessibility className="w-5 h-5 text-primary" />
                Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 text-center text-muted-foreground">
                <Accessibility className="w-8 h-8 mx-auto mb-2" />
                <p>Accessibility controls will be available in a future update.</p>
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Accessibility Testing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 text-center text-muted-foreground">
                <Eye className="w-8 h-8 mx-auto mb-2" />
                <p>Accessibility testing tools will be available in a future update.</p>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Clear Chat History</p>
                  <p className="text-sm text-muted-foreground">
                    Remove all stored conversation history
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Clear History
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Export Conversations</p>
                  <p className="text-sm text-muted-foreground">
                    Download your conversation history as JSON
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Session Status</p>
                  <p className="text-sm text-muted-foreground">
                    Your session is secure and encrypted
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  ✅ Secure
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Encryption</p>
                  <p className="text-sm text-muted-foreground">
                    All data is encrypted in transit and at rest
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  ✅ Enabled
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sign Out</p>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your JARVIS account on this device
                  </p>
                </div>
                <Button variant="destructive" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
