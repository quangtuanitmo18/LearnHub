'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/stores/auth-store';
import { useState } from 'react';
import { MdNotifications, MdSecurity } from 'react-icons/md';
import PasswordChangeDialog from './password-change-dialog';

// Settings tab component - Arrow function
const SettingsTab = () => {
  const user = useAuthStore((state) => state.user);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Mock settings state - replace with real state management
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    darkMode: false,
    language: 'vi',
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    // Here you would also call an API to save the setting
  };

  if (!user) return null;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="mb-1 text-xl font-bold sm:mb-2 sm:text-2xl">Settings</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your account settings and personal preferences
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {/* Security Settings */}
        <Card>
          <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
            <div className="flex items-center gap-2">
              <MdSecurity className="h-4 w-4 sm:h-5 sm:w-5" />
              <CardTitle className="text-base sm:text-lg">Security</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4 sm:space-y-4 sm:px-6 sm:pb-6">
            <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium sm:text-base">Password</p>
                <p className="text-muted-foreground truncate text-xs sm:text-sm">
                  Last updated: {new Date().toLocaleDateString('en-US')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPasswordDialogOpen(true)}
                disabled={user.userType !== 'default'}
                className="h-8 w-full text-xs sm:h-9 sm:w-auto sm:text-sm"
              >
                {user.userType !== 'default' ? 'Not Available' : 'Change Password'}
              </Button>
            </div>

            {user.userType !== 'default' && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4 dark:border-blue-800 dark:bg-blue-950/20">
                <p className="text-xs text-blue-600 sm:text-sm dark:text-blue-400">
                  <strong>Note:</strong> Your account is linked with{' '}
                  {user.userType === 'google' ? 'Google' : 'Facebook'}. Please change your password
                  through your {user.userType === 'google' ? 'Google' : 'Facebook'} account.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
            <div className="flex items-center gap-2">
              <MdNotifications className="h-4 w-4 sm:h-5 sm:w-5" />
              <CardTitle className="text-base sm:text-lg">Notifications</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Manage how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4 sm:space-y-6 sm:px-6 sm:pb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex-1 space-y-0.5">
                <Label htmlFor="email-notifications" className="text-sm sm:text-base">
                  Email Notifications
                </Label>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Receive notifications about courses and activities via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                className="self-start sm:self-center"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Change Dialog */}
      <PasswordChangeDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
    </div>
  );
};

export default SettingsTab;
