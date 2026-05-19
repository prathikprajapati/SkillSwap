import { User, Bell, Lock, Globe, Shield, Save } from "lucide-react";

export function SettingsPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2 animate-[fade-in-up_0.4s_ease-out_forwards]">Settings</h1>
        <p className="text-muted-foreground mb-8 animate-[fade-in-up_0.4s_ease-out_forwards]">Manage your account preferences and settings</p>
        
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 flex-shrink-0 animate-[fade-in-up_0.4s_ease-out_forwards]">
            <nav className="card-hover bg-elevated border-border rounded-xl p-2 space-y-1">
              {[
                { icon: User, label: "Profile Information", active: true },
                { icon: Bell, label: "Notifications", active: false },
                { icon: Lock, label: "Security", active: false },
                { icon: Globe, label: "Language & Region", active: false },
                { icon: Shield, label: "Privacy", active: false },
              ].map((item, i) => (
                <button 
                  key={i} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    item.active ? "bg-primary text-white" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1 card-hover bg-elevated border-border rounded-xl p-6 md:p-8 animate-[fade-in-up_0.4s_ease-out_forwards]" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-border">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  AJ
                </div>
                <div>
                  <button className="btn-secondary py-2 px-4 mb-2 text-sm">Change Avatar</button>
                  <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" htmlFor="firstName">First Name</label>
                  <input id="firstName" type="text" defaultValue="Alex" className="input-base w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" htmlFor="lastName">Last Name</label>
                  <input id="lastName" type="text" defaultValue="Johnson" className="input-base w-full" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="email">Email Address</label>
                <input id="email" type="email" defaultValue="alex.johnson@example.com" className="input-base w-full" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="bio">Bio</label>
                <textarea id="bio" rows={4} className="input-base w-full h-auto py-3 resize-none" defaultValue="UX Designer passionate about learning new languages. Offering design critiques in exchange for Spanish conversation practice." />
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-border mt-8">
                <button className="btn-ghost py-2 px-4">Cancel</button>
                <button className="btn-primary py-2 px-6">
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

