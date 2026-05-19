"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Switch } from "@/app/components/ui/switch";
import { useAuth } from "@/app/contexts/AuthContext";
import { User, GraduationCap, Bell, Palette, Shield, Trash2, Camera } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      bio: "",
    },
  });

  const onSubmit = (data: any) => {
    console.log("Save settings:", data);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Settings</h1>

        <Tabs defaultValue="account" onValueChange={setActiveTab}>
          <TabsList className="bg-[var(--color-surface)] border border-[var(--color-border)] mb-6 flex flex-wrap h-auto">
            <TabsTrigger value="account" className="data-[state=active]:bg-[var(--color-accent)] data-[state=active]:text-white">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-[var(--color-accent)] data-[state=active]:text-white">
              <GraduationCap className="h-4 w-4 mr-2" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-[var(--color-accent)] data-[state=active]:text-white">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-[var(--color-accent)] data-[state=active]:text-white">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-[var(--color-accent)] data-[state=active]:text-white">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">Account Information</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-[var(--color-accent)] text-white text-2xl">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" className="border-[var(--color-border)]">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[var(--color-text-primary)]">Name</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      className="bg-[var(--color-surface-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[var(--color-text-primary)]">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      className="bg-[var(--color-surface-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-[var(--color-text-primary)]">Bio</Label>
                  <textarea
                    id="bio"
                    rows={4}
                    placeholder="Tell others about yourself..."
                    className="w-full px-3 py-2 rounded-md bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>

                <Button type="submit" className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90">
                  Save Changes
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="skills">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">Manage Skills</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">Skills I Can Teach</h3>
                  <div className="p-4 rounded-lg bg-[var(--color-surface-elevated)] border border-dashed border-[var(--color-border)]">
                    {user?.offeredSkills?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {user.offeredSkills.map((skill) => (
                          <span key={skill.id} className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[var(--color-text-muted)] text-sm">No skills added yet</p>
                    )}
                  </div>
                  <Button variant="outline" className="mt-3 border-[var(--color-border)]">
                    Add Skill to Teach
                  </Button>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">Skills I Want to Learn</h3>
                  <div className="p-4 rounded-lg bg-[var(--color-surface-elevated)] border border-dashed border-[var(--color-border)]">
                    {user?.wantedSkills?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {user.wantedSkills.map((skill) => (
                          <span key={skill.id} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[var(--color-text-muted)] text-sm">No skills added yet</p>
                    )}
                  </div>
                  <Button variant="outline" className="mt-3 border-[var(--color-border)]">
                    Add Skill to Learn
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">Notification Preferences</h2>
              
              <div className="space-y-4">
                {[
                  { label: "New match requests", desc: "Get notified when someone wants to connect" },
                  { label: "Messages", desc: "Receive notifications for new messages" },
                  { label: "Match suggestions", desc: "Weekly digest of potential matches" },
                  { label: "Skill session reminders", desc: "Reminders for scheduled skill exchanges" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)]">{item.label}</p>
                      <p className="text-sm text-[var(--color-text-muted)]">{item.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">Appearance</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">Dark Mode</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Use dark theme throughout the app</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">Compact View</p>
                    <p className="text-sm text-[var(--color-text-muted)]">Show more content with less spacing</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">Security</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-[var(--color-text-primary)]">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      className="bg-[var(--color-surface-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-[var(--color-text-primary)]">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      className="bg-[var(--color-surface-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-[var(--color-text-primary)]">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      className="bg-[var(--color-surface-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)]"
                    />
                  </div>
                  <Button className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90">
                    Update Password
                  </Button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-[var(--radius-xl)] p-6">
                <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </h2>
                <p className="text-[var(--color-text-secondary)] mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
                  Delete Account
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
