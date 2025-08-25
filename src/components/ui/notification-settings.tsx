import React from "react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./table";
import { Bell, Mail, Shield, Megaphone, RefreshCw } from "lucide-react";
import {
  notificationService,
  NotificationSettings,
  NotificationHistory,
} from "@/lib/notification-service";
import { toast } from "sonner";

export function NotificationSettingsPanel() {
  const [settings, setSettings] = React.useState<NotificationSettings | null>(
    null,
  );
  const [history, setHistory] = React.useState<NotificationHistory[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsData, historyData] = await Promise.all([
        notificationService.getSettings(),
        notificationService.getNotificationHistory(),
      ]);
      setSettings(settingsData);
      setHistory(historyData);
      if (settingsData?.email) {
        setEmail(settingsData.email);
      }
    } catch (error) {
      console.error("Failed to load notification data:", error);
      toast.error("Failed to load notification settings");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (key: keyof NotificationSettings) => {
    if (!settings) return;

    try {
      const newSettings = {
        ...settings,
        [key]: !settings[key],
      };
      await notificationService.updateSettings({ [key]: !settings[key] });
      setSettings(newSettings);
      toast.success("Notification settings updated");
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error("Failed to update settings");
    }
  };

  const handleEmailUpdate = async () => {
    if (!email) return;

    try {
      await notificationService.updateSettings({ email });
      toast.success("Email updated successfully");
    } catch (error) {
      console.error("Failed to update email:", error);
      toast.error("Failed to update email");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Notification Settings</h2>
            </div>
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Email Address
                </label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                  <Button onClick={handleEmailUpdate}>Update</Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">KYC Status Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about your KYC verification status
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={
                      settings?.kyc_status_updates ? "default" : "outline"
                    }
                    onClick={() => handleToggle("kyc_status_updates")}
                  >
                    {settings?.kyc_status_updates ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Document Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified about document submission and verification
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={settings?.document_updates ? "default" : "outline"}
                    onClick={() => handleToggle("document_updates")}
                  >
                    {settings?.document_updates ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Security Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Important security notifications and alerts
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={settings?.security_alerts ? "default" : "outline"}
                    onClick={() => handleToggle("security_alerts")}
                  >
                    {settings?.security_alerts ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Megaphone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Marketing Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Receive news about products, features and updates
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={
                      settings?.marketing_updates ? "default" : "outline"
                    }
                    onClick={() => handleToggle("marketing_updates")}
                  >
                    {settings?.marketing_updates ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-6">Notification History</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      {new Date(notification.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="capitalize">
                      {notification.type.replace("_", " ")}
                    </TableCell>
                    <TableCell>{notification.subject}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${
                          notification.status === "sent"
                            ? "bg-green-100 text-green-800"
                            : notification.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {notification.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {history.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground"
                    >
                      No notifications yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
