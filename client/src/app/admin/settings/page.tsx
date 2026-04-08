import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <Badge variant="secondary" className="mb-3">
          Admin
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage system-level preferences for your admin workspace.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
          <CardDescription>
            This section is now wired and no longer routes to a blank page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Add your configuration panels here (security, integrations, notifications, audit, and
            system preferences).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
