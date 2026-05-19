import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Calendar, Clock, Star, Award, PlusCircle, LogOut, CheckCircle2, XCircle, Grid, MessageSquare, User as UserIcon, Settings, Loader2 } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher";
import { ThemeWrapper } from "@/app/components/ThemeWrapper";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface MatchRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
    offeredSkills?: Array<{ name: string }>;
    wantedSkills?: Array<{ name: string }>;
  };
}

export default function Dashboard() {
  const { logout, user, firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [incomingRequests, setIncomingRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const navLinks = [
    { icon: Grid, label: "Feed", to: "/dashboard", active: true },
    { icon: Calendar, label: "Schedule", to: "/schedule", active: false },
    { icon: MessageSquare, label: "Messages", to: "/messages", active: false },
    { icon: UserIcon, label: "Profile", to: "/profile/me", active: false },
    { icon: Settings, label: "Settings", to: "/settings", active: false },
  ];

  useEffect(() => {
    fetchIncomingRequests();
  }, [firebaseUser]);

  const fetchIncomingRequests = async () => {
    if (!firebaseUser) return;

    try {
      setLoading(true);
      const idToken = await firebaseUser.getIdToken();
      
      const response = await fetch(`${API_BASE_URL}/requests/incoming`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setIncomingRequests(data.filter((r: MatchRequest) => r.status === 'pending'));
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    if (!firebaseUser) return;

    setProcessingId(requestId);
    try {
      const idToken = await firebaseUser.getIdToken();
      
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to accept request');
      }

      // Remove from list after accepting
      setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Error accepting request:', err);
      alert('Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    if (!firebaseUser) return;

    setProcessingId(requestId);
    try {
      const idToken = await firebaseUser.getIdToken();
      
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to decline request');
      }

      // Remove from list after declining
      setIncomingRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Error declining request:', err);
      alert('Failed to decline request');
    } finally {
      setProcessingId(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background flex justify-center py-8">
      <div className="container max-w-[1280px] mx-auto px-4 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Navigation & Profile */}
        <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 space-y-6">
          {/* Profile Summary Card */}
          <div className="card-hover p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">
                  {user?.name ? getInitials(user.name) : 'U'}
                </span>
              </div>
              <h2 className="text-xl mb-1">{user?.name || 'User'}</h2>
              <p className="text-sm text-muted-foreground mb-4">{user?.email || ''}</p>
              
              <div className="flex items-center gap-4 w-full justify-center mb-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-warning fill-warning flex-shrink-0" />
                  <span className="font-semibold">New</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>0h</span>
                </div>
              </div>
              
              <div className="divider-compact"></div>
              
              {/* Theme Switcher */}
              <div className="mb-4">
                <ThemeWrapper>
                  <ThemeSwitcher variant="compact" className="w-full" />
                </ThemeWrapper>
              </div>
              
              <div className="divider-compact"></div>
              
              <div className="flex items-center justify-between w-full text-sm">
                <span className="text-muted-foreground">Requests</span>
                <span className="font-semibold text-primary">
                  {incomingRequests.length} pending
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
                    <link.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                  {/* Add divider after "Messages" link */}
                  {link.label === "Messages" && <div className="nav-divider" />}
                </li>
              ))}
              <li>
                {/* Divider before Sign Out */}
                <div className="nav-divider" />
                <button 
                  onClick={async () => {
                    await logout();
                    navigate("/auth");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-error hover:bg-error/10 transition-colors"
                >
                  <LogOut className="h-5 w-5 flex-shrink-0" />
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
              <PlusCircle className="h-4 w-4 mr-2 flex-shrink-0" /> Offer Skill
            </Link>
          </div>

          {/* Section Divider */}
          <div className="divider-gradient my-6" />

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Pending Requests", value: incomingRequests.length.toString(), icon: Users, color: "text-blue-500" },
              { label: "Upcoming", value: "0", icon: Calendar, color: "text-green-500" },
              { label: "Hours", value: "0", icon: Clock, color: "text-purple-500" },
              { label: "Reviews", value: "0", icon: Star, color: "text-yellow-500" }
            ].map((stat, i) => (
              <div key={i} className="bg-elevated border border-border rounded-lg p-4 flex flex-col items-center justify-center text-center animate-[fade-in-up_0.4s_ease-out_forwards]" style={{ animationDelay: `${i * 100}ms` }}>
                <stat.icon className={`h-6 w-6 mb-2 ${stat.color} flex-shrink-0`} />
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Divider between stats and requests */}
          <div className="divider" />

          {/* Incoming Requests Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent text-xl font-semibold">Incoming Requests</h2>
              <Link to="/requests" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : incomingRequests.length === 0 ? (
              <div className="text-center py-12 bg-elevated border border-border rounded-xl">
                <p className="text-muted-foreground">No pending requests</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse skills to send match requests!
                </p>
                <Link to="/browse" className="btn-primary mt-4 py-2 px-4 inline-block">
                  Browse Skills
                </Link>
              </div>
            ) : (
              incomingRequests.map((request, index) => (
                <div 
                  key={request.id} 
                  className="card-hover p-5 animate-[fade-in-up_0.4s_ease-out_forwards]"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-semibold text-secondary">
                        {getInitials(request.sender?.name || 'User')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{request.sender?.name || 'Unknown'}</h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border text-muted-foreground">
                            New Request
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {formatTime(request.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium text-foreground mb-2">
                        Wants to exchange skills
                      </p>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {request.sender?.offeredSkills?.length 
                          ? `Offers: ${request.sender.offeredSkills.map(s => s.name).join(', ')}`
                          : 'Interested in skill exchange with you'}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-4">
                        <button 
                          onClick={() => handleAccept(request.id)}
                          disabled={processingId === request.id}
                          className="btn-primary py-1.5 px-4 text-sm disabled:opacity-50"
                        >
                          {processingId === request.id ? (
                            <Loader2 className="h-4 w-4 mr-1.5 flex-shrink-0 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 mr-1.5 flex-shrink-0" />
                          )}
                          Accept
                        </button>
                        <button 
                          onClick={() => handleDecline(request.id)}
                          disabled={processingId === request.id}
                          className="btn-secondary py-1.5 px-4 text-sm disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4 mr-1.5 flex-shrink-0" /> Decline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
        
        {/* Right Sidebar - Optional extra info */}
        <aside className="hidden lg:block w-72 flex-shrink-0 space-y-6">
          <div className="card-hover p-5 border-l-4 border-l-primary">
            <h3 className="flex items-center gap-2 text-lg mb-2">
              <Award className="h-5 w-5 text-primary flex-shrink-0" />
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
