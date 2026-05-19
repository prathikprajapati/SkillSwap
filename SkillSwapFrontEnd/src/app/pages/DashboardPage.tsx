import { Link } from "react-router";
import { Calendar, MessageSquare, Star, Clock, Users, Award, PlusCircle, Settings, Grid, User as UserIcon, LogOut, CheckCircle2, XCircle } from "lucide-react";
import { Avatar } from "@/components/base/avatar/avatar";

export function DashboardPage() {
  const profileSummary = {
    name: "Alex Johnson",
    role: "UX Designer & Spanish Learner",
    avatar: "AJ",
    rating: 4.9,
    reviews: 124,
    hours: 24,
    level: "Gold"
  };

  const navLinks = [
    { icon: Grid, label: "Feed", to: "/dashboard", active: true },
    { icon: Calendar, label: "Schedule", to: "/schedule", active: false },
    { icon: MessageSquare, label: "Messages", to: "/messages", active: false },
    { icon: UserIcon, label: "Profile", to: "/profile/me", active: false },
    { icon: Settings, label: "Settings", to: "/settings", active: false },
  ];

  const feedItems = [
    {
      id: 1,
      type: "request",
      user: "Emma Davis",
      avatar: "ED",
      skill: "JavaScript Fundamentals",
      time: "2 hours ago",
      content: "Hi Alex! I saw you're offering JavaScript lessons. I'm a beginner and would love to exchange my Spanish conversational skills for some JS help.",
      actionRequired: true
    },
    {
      id: 2,
      type: "match",
      user: "Sarah Miller",
      avatar: "SM",
      skill: "Web Development",
      time: "5 hours ago",
      content: "You and Sarah are a match! You can now start scheduling sessions together.",
      actionRequired: false
    },
    {
      id: 3,
      type: "session",
      user: "Maria Garcia",
      avatar: "MG",
      skill: "Spanish Conversation",
      time: "Today, 3:00 PM",
      content: "Upcoming session in 2 hours. Don't forget to prepare your notes!",
      actionRequired: false
    },
    {
      id: 4,
      type: "review",
      user: "Jake Wilson",
      avatar: "JW",
      skill: "Guitar Fundamentals",
      time: "1 day ago",
      content: "Alex is an amazing teacher! Very patient and explains concepts clearly. Looking forward to our next session.",
      rating: 5,
      actionRequired: false
    }
  ];

  return (
    <div className="min-h-screen bg-background flex justify-center py-8">
      <div className="container max-w-[1280px] mx-auto px-4 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Navigation & Profile */}
        <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 space-y-6">
          {/* Profile Summary Card */}
          <div className="card-hover p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar
                src={undefined}
                alt={profileSummary.name}
                size="xl"
                initials={profileSummary.avatar}
                className="mb-4"
              />
              <h2 className="text-xl mb-1">{profileSummary.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">{profileSummary.role}</p>
              
              <div className="flex items-center gap-4 w-full justify-center mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-warning fill-warning" />
                  <span className="font-semibold">{profileSummary.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{profileSummary.hours}h</span>
                </div>
              </div>
              
              <div className="w-full h-px bg-border mb-4"></div>
              
              <div className="flex items-center justify-between w-full text-sm">
                <span className="text-muted-foreground">Level</span>
                <span className="font-semibold text-primary flex items-center gap-1">
                  <Award className="h-4 w-4" /> {profileSummary.level}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="card-hover p-4 hidden md:block">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                      link.active 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-surface hover:text-foreground"
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-error hover:bg-error/10 transition-colors mt-4">
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Feed Content */}
        <main className="flex-1 max-w-3xl space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent text-3xl">Your Activity Feed</h1>
            <Link to="/create" className="btn-primary py-2 px-4 text-sm">
              <PlusCircle className="h-4 w-4 mr-2" /> Offer Skill
            </Link>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Active Swaps", value: "5", icon: Users, color: "text-blue-500" },
              { label: "Upcoming", value: "3", icon: Calendar, color: "text-green-500" },
              { label: "Hours", value: "24", icon: Clock, color: "text-purple-500" },
              { label: "Reviews", value: "124", icon: Star, color: "text-yellow-500" }
            ].map((stat, i) => (
              <div key={i} className="bg-elevated border border-border rounded-lg p-4 flex flex-col items-center justify-center text-center animate-[fade-in-up_0.4s_ease-out_forwards]" style={{ animationDelay: `${i * 100}ms` }}>
                <stat.icon className={`h-6 w-6 mb-2 ${stat.color}`} />
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Feed */}
          <div className="space-y-4">
            {feedItems.map((item, index) => (
              <div 
                key={item.id} 
                className="card-hover p-5 animate-[fade-in-up_0.4s_ease-out_forwards]"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    src={undefined}
                    alt={item.user}
                    size="sm"
                    initials={item.avatar}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold">{item.user}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border text-muted-foreground">
                          {item.type === 'request' ? 'New Request' : item.type === 'match' ? 'New Match' : item.type === 'session' ? 'Upcoming Session' : 'Review'}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{item.time}</span>
                    </div>
                    
                    <p className="text-sm font-medium text-foreground mb-2">Re: {item.skill}</p>
                    
                    {item.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < item.rating! ? 'text-warning fill-warning' : 'text-border'}`} />
                        ))}
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.content}</p>
                    
                    {item.actionRequired && (
                      <div className="flex items-center gap-3 mt-4">
                        <button className="btn-primary py-1.5 px-4 text-sm">
                          <CheckCircle2 className="h-4 w-4 mr-1.5" /> Accept
                        </button>
                        <button className="btn-secondary py-1.5 px-4 text-sm">
                          <XCircle className="h-4 w-4 mr-1.5" /> Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
        
        {/* Right Sidebar - Optional extra info */}
        <aside className="hidden lg:block w-72 flex-shrink-0 space-y-6">
          <div className="card-hover p-5 border-l-4 border-l-primary">
            <h3 className="flex items-center gap-2 text-lg mb-2">
              <Award className="h-5 w-5 text-primary" />
              Level up!
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete 2 more hours of teaching to unlock the Platinum badge.
            </p>
            <div className="h-2 rounded-full bg-surface overflow-hidden mb-2">
              <div className="h-full bg-primary rounded-full" style={{ width: "80%" }} />
            </div>
            <p className="text-xs text-right font-medium">8 / 10 hours</p>
          </div>
        </aside>

      </div>
    </div>
  );
}

