import { useState } from "react";
import { Save, Bell, Mail, MessageSquare, Calendar, Star } from "lucide-react";

export function NotificationsSection() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    messageAlerts: true,
    sessionReminders: true,
    reviewNotifications: true,
    marketingEmails: false,
    pushNotifications: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const notificationGroups = [
    {
      title: "Email Notifications",
      icon: Mail,
      items: [
        { key: "emailNotifications", label: "Email notifications", description: "Receive general notifications via email" },
        { key: "marketingEmails", label: "Marketing emails", description: "Receive updates about new features and promotions" },
      ]
    },
    {
      title: "Activity Alerts",
      icon: Bell,
      items: [
        { key: "messageAlerts", label: "Message alerts", description: "Get notified when you receive a new message" },
        { key: "sessionReminders", label: "Session reminders", description: "Receive reminders before scheduled sessions" },
        { key: "reviewNotifications", label: "Review notifications", description: "Get notified when someone leaves a review" },
      ]
    },
    {
      title: "Push Notifications",
      icon: MessageSquare,
      items: [
        { key: "pushNotifications", label: "Push notifications", description: "Enable browser push notifications" },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Notifications</h2>
      <p className="text-muted-foreground mb-6">Choose how you want to be notified about activity in your account.</p>
      
      {notificationGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="pb-6 border-b border-border last:border-0">
          <div className="flex items-center gap-2 mb-4">
            <group.icon className="h-5 w-5 text-primary flex-shrink-0" />
            <h3 className="font-medium">{group.title}</h3>
          </div>
          
          <div className="space-y-4">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <button
                  onClick={() => toggleSetting(item.key as keyof typeof settings)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings[item.key as keyof typeof settings] ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings[item.key as keyof typeof settings] ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-border mt-8">
        <button className="btn-ghost py-2 px-4 w-full sm:w-auto">Cancel</button>
        <button className="btn-primary py-2 px-6 w-full sm:w-auto inline-flex items-center justify-center gap-2">
          <Save className="h-4 w-4 flex-shrink-0" /> Save Changes
        </button>
      </div>
    </div>
  );
}
