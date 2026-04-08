'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateUserSettings, useUserSettings } from '@/hooks/use-user-settings';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect, useState } from 'react';
import { MdNotifications, MdSecurity } from 'react-icons/md';
import { toast } from 'sonner';
import PasswordChangeDialog from './password-change-dialog';

// Settings tab component - Arrow function
const SettingsTab = () => {
  const user = useAuthStore((state) => state.user);
  const { data: serverSettings, isLoading: isSettingsLoading } = useUserSettings();
  const updateSettingsMutation = useUpdateUserSettings();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const normalizedUserType = (user?.userType || '').toUpperCase();
  const isLocalAccount = normalizedUserType === 'DEFAULT';
  const providerLabel =
    normalizedUserType === 'GOOGLE'
      ? 'Google'
      : normalizedUserType === 'FACEBOOK'
        ? 'Facebook'
        : 'social provider';

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    darkMode: false,
    language: 'vi' as 'vi' | 'en',
  });

  useEffect(() => {
    if (serverSettings) {
      setSettings(serverSettings);
    }
  }, [serverSettings]);

  const handleSettingChange = (key: string, value: boolean) => {
    const previous = settings;
    const next = { ...settings, [key]: value };

    setSettings(next);

    updateSettingsMutation.mutate(
      { [key]: value },
      {
        onError: (error) => {
          setSettings(previous);
          toast.error(error.message || 'Failed to update settings');
        },
      },
    );
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
                disabled={!isLocalAccount}
                className="h-8 w-full text-xs sm:h-9 sm:w-auto sm:text-sm"
              >
                {!isLocalAccount ? 'Not Available' : 'Change Password'}
              </Button>
            </div>

            {!isLocalAccount && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4 dark:border-blue-800 dark:bg-blue-950/20">
                <p className="text-xs text-blue-600 sm:text-sm dark:text-blue-400">
                  <strong>Note:</strong> Your account is linked with {providerLabel}. Please change
                  your password through your {providerLabel} account.
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
            {isSettingsLoading && (
              <p className="text-muted-foreground text-xs sm:text-sm">Loading your settings...</p>
            )}

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
                disabled={isSettingsLoading || updateSettingsMutation.isPending}
                className="self-start sm:self-center"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex-1 space-y-0.5">
                <Label htmlFor="push-notifications" className="text-sm sm:text-base">
                  Push Notifications
                </Label>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Receive push notifications for important updates
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                disabled={isSettingsLoading || updateSettingsMutation.isPending}
                className="self-start sm:self-center"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex-1 space-y-0.5">
                <Label htmlFor="marketing-emails" className="text-sm sm:text-base">
                  Marketing Emails
                </Label>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Receive product news, tips, and promotional emails
                </p>
              </div>
              <Switch
                id="marketing-emails"
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                disabled={isSettingsLoading || updateSettingsMutation.isPending}
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
