import { useState } from "react";
import { Save, Shield, Eye, Users, Search, Trash2 } from "lucide-react";

export function PrivacySection() {
  const [settings, setSettings] = useState({
    profileVisible: true,
    showEmail: false,
    showSkills: true,
    allowSearch: true,
    showActivity: true,
    dataSharing: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Privacy</h2>
      
      {/* Profile Visibility */}
      <div className="pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="font-medium">Profile Visibility</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Public profile</p>
              <p className="text-xs text-muted-foreground">Allow others to view your profile</p>
            </div>
            <button
              onClick={() => toggleSetting("profileVisible")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.profileVisible ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.profileVisible ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Show email address</p>
              <p className="text-xs text-muted-foreground">Make your email visible to other users</p>
            </div>
            <button
              onClick={() => toggleSetting("showEmail")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.showEmail ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showEmail ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Show my skills</p>
              <p className="text-xs text-muted-foreground">Display your offered skills on your profile</p>
            </div>
            <button
              onClick={() => toggleSetting("showSkills")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.showSkills ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showSkills ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Discovery */}
      <div className="pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="font-medium">Discovery</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Allow search engines</p>
              <p className="text-xs text-muted-foreground">Let search engines index your profile</p>
            </div>
            <button
              onClick={() => toggleSetting("allowSearch")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.allowSearch ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.allowSearch ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="font-medium">Activity</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Show activity status</p>
              <p className="text-xs text-muted-foreground">Let others see when you're online</p>
            </div>
            <button
              onClick={() => toggleSetting("showActivity")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.showActivity ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showActivity ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="font-medium">Data & Privacy</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Data sharing</p>
              <p className="text-xs text-muted-foreground">Share usage data to help us improve</p>
            </div>
            <button
              onClick={() => toggleSetting("dataSharing")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.dataSharing ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.dataSharing ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="h-5 w-5 text-error flex-shrink-0" />
          <h3 className="font-medium text-error">Danger Zone</h3>
        </div>
        
        <div className="p-4 border border-error/20 rounded-lg bg-error/5">
          <p className="text-sm text-muted-foreground mb-3">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="btn-secondary text-error border-error/30 hover:bg-error/10">
            Delete Account
          </button>
        </div>
      </div>
      
      <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-border mt-8">
        <button className="btn-ghost py-2 px-4 w-full sm:w-auto">Cancel</button>
        <button className="btn-primary py-2 px-6 w-full sm:w-auto inline-flex items-center justify-center gap-2">
          <Save className="h-4 w-4 flex-shrink-0" /> Save Changes
        </button>
      </div>
    </div>
  );
}
