import { useState } from "react";
import { Save, Lock, Key, Shield, Smartphone, History } from "lucide-react";

export function SecuritySection() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Security</h2>
      
      {/* Password Change */}
      <div className="pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="font-medium">Change Password</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="currentPassword">Current Password</label>
            <input 
              id="currentPassword" 
              type="password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-base w-full" 
              placeholder="Enter your current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="newPassword">New Password</label>
            <input 
              id="newPassword" 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-base w-full" 
              placeholder="Enter your new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="confirmPassword">Confirm New Password</label>
            <input 
              id="confirmPassword" 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-base w-full" 
              placeholder="Confirm your new password"
            />
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="pb-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
          </div>
          <button
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              twoFactorEnabled ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                twoFactorEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        
        {twoFactorEnabled && (
          <div className="p-4 bg-accent/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication is enabled. You'll receive a verification code on your phone when signing in.
            </p>
          </div>
        )}
      </div>

      {/* Login Sessions */}
      <div className="pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="font-medium">Active Sessions</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
            <div>
              <p className="text-sm font-medium">Current Session</p>
              <p className="text-xs text-muted-foreground">Chrome on Windows • Started today</p>
            </div>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Active</span>
          </div>
        </div>
        
        <button className="mt-3 text-sm text-error hover:text-error/80 transition-colors">
          Sign out all other sessions
        </button>
      </div>

      {/* Security Log */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="font-medium">Security Log</h3>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
            <span>Password changed</span>
            <span className="text-muted-foreground">2 weeks ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
            <span>New device signed in</span>
            <span className="text-muted-foreground">1 month ago</span>
          </div>
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
