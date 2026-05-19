import { useState } from "react";
import { User, Bell, Lock, Globe, Shield } from "lucide-react";
import { ProfileSection } from "./settings/ProfileSection";
import { NotificationsSection } from "./settings/NotificationsSection";
import { SecuritySection } from "./settings/SecuritySection";
import { LanguageSection } from "./settings/LanguageSection";
import { PrivacySection } from "./settings/PrivacySection";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSection />;
      case "notifications":
        return <NotificationsSection />;
      case "security":
        return <SecuritySection />;
      case "language":
        return <LanguageSection />;
      case "privacy":
        return <PrivacySection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8">
      <div className="container max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2 animate-[fade-in-up_0.4s_ease-out_forwards]">Settings</h1>
        <p className="text-muted-foreground mb-8 animate-[fade-in-up_0.4s_ease-out_forwards]">Manage your account preferences and settings</p>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-72 flex-shrink-0 animate-[fade-in-up_0.4s_ease-out_forwards]">
            <nav className="card-hover bg-elevated border-border rounded-xl p-2 space-y-1">
              {[
                { icon: User, label: "Profile Information", id: "profile" },
                { icon: Bell, label: "Notifications", id: "notifications" },
                { icon: Lock, label: "Security", id: "security" },
                { icon: Globe, label: "Language & Region", id: "language" },
                { icon: Shield, label: "Privacy", id: "privacy" },
              ].map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id ? "bg-primary text-white" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1 card-hover bg-elevated border-border rounded-xl p-6 md:p-8 animate-[fade-in-up_0.4s_ease-out_forwards]" style={{ animationDelay: '100ms' }}>
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}
