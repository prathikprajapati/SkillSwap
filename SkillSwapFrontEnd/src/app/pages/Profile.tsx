import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { Star, MapPin, Calendar, CheckCircle, MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface UserSkill {
  id: string;
  skill_id: string;
  skill_type: "offer" | "want";
  proficiency_level: "beginner" | "intermediate" | "expert";
  skill: {
    id: string;
    name: string;
    category: string | null;
  };
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  created_at: string;
}

export default function Profile() {
  const { username } = useParams();
  const { firebaseUser, user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, [firebaseUser, username]);

  const fetchProfileData = async () => {
    if (!firebaseUser) return;

    try {
      setLoading(true);
      setError(null);

      const idToken = await firebaseUser.getIdToken();

      // If viewing own profile or no username specified, use /users/me
      // Otherwise we'd need a public profile endpoint (not implemented yet)
      const isOwnProfile = !username || username === "me" || username === currentUser?.name?.toLowerCase().replace(/\s+/g, '-');
      
      if (isOwnProfile) {
        // Fetch own profile
        const [profileRes, skillsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' }
          }),
          fetch(`${API_BASE_URL}/users/me/skills`, {
            headers: { 'Authorization': `Bearer ${idToken}`, 'Content-Type': 'application/json' }
          })
        ]);

        if (!profileRes.ok) throw new Error('Failed to fetch profile');
        if (!skillsRes.ok) throw new Error('Failed to fetch skills');

        const profileData = await profileRes.json();
        const skillsData = await skillsRes.json();

        setProfile(profileData);
        setUserSkills(skillsData);
      } else {
        setError("Viewing other user profiles is not yet implemented. Try viewing your own profile.");
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const offeredSkills = userSkills.filter(us => us.skill_type === 'offer');
  const wantedSkills = userSkills.filter(us => us.skill_type === 'want');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <p className="text-error mb-4">{error || 'Profile not found'}</p>
            <button onClick={fetchProfileData} className="btn-primary py-2 px-4">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-primary">
                {getInitials(profile.name)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl">{profile.name}</h1>
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
              </div>
              <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary flex-shrink-0" />
                  <span className="font-semibold text-foreground">New</span>
                  <span>(0 reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{profile.location || 'Remote'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Member since {formatMemberSince(profile.created_at)}</span>
                </div>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                {profile.bio || `Hi! I'm ${profile.name}. I'm using SkillSwap to exchange skills with others.`}
              </p>
            </div>
            <Link to="/messages" className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <MessageSquare className="h-5 w-5 flex-shrink-0" />
              <span>Messages</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills Offered */}
            <div>
              <h2 className="text-2xl mb-4">Skills Offered ({offeredSkills.length})</h2>
              {offeredSkills.length === 0 ? (
                <div className="p-6 rounded-xl border bg-card text-center">
                  <p className="text-muted-foreground mb-4">No skills offered yet</p>
                  <Link to="/create" className="btn-primary py-2 px-4 inline-block">
                    Offer a Skill
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {offeredSkills.map((userSkill) => (
                    <Link
                      key={userSkill.id}
                      to={`/skill/${userSkill.id}`}
                      className="block p-6 rounded-xl border bg-card hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="mb-2">{userSkill.skill.name}</h3>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary">
                              {userSkill.skill.category || 'General'}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-md bg-accent capitalize">
                              {userSkill.proficiency_level}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary flex-shrink-0" />
                          <span>New</span>
                        </div>
                        <span>Looking for exchange</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Skills Wanted */}
            <div>
              <h2 className="text-2xl mb-4">Skills Wanted ({wantedSkills.length})</h2>
              {wantedSkills.length === 0 ? (
                <div className="p-6 rounded-xl border bg-card text-center">
                  <p className="text-muted-foreground">No skills wanted yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {wantedSkills.map((userSkill) => (
                    <div key={userSkill.id} className="p-4 rounded-lg border bg-card">
                      <h4 className="mb-1">{userSkill.skill.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Looking to learn at {userSkill.proficiency_level} level
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Placeholder */}
            <div>
              <h2 className="text-2xl mb-4">Reviews</h2>
              <div className="p-6 rounded-xl border bg-card text-center">
                <p className="text-muted-foreground">No reviews yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start swapping skills to get reviews!
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats */}
            <div className="p-6 rounded-xl border bg-card">
              <h3 className="mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Skills Offered</span>
                  <span className="text-2xl font-semibold">{offeredSkills.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Skills Wanted</span>
                  <span className="text-2xl font-semibold">{wantedSkills.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Swaps Completed</span>
                  <span className="text-2xl font-semibold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average Rating</span>
                  <span className="text-2xl font-semibold">-</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 rounded-xl border bg-card">
              <h3 className="mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/create" className="block w-full text-center py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Offer a Skill
                </Link>
                <Link to="/browse" className="block w-full text-center py-2 px-4 border rounded-lg hover:bg-accent transition-colors">
                  Browse Skills
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
