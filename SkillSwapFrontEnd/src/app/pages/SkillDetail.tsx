import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Star, Clock, MapPin, MessageSquare, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  skill_type: "offer" | "want";
  proficiency_level: "beginner" | "intermediate" | "expert";
  created_at: string;
  skill: {
    id: string;
    name: string;
    category: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    created_at: string;
  };
}

export default function SkillDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { firebaseUser, user } = useAuth();
  const [userSkill, setUserSkill] = useState<UserSkill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    fetchSkillDetail();
  }, [id]);

  const fetchSkillDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!firebaseUser || !id) {
        setLoading(false);
        return;
      }

      const idToken = await firebaseUser.getIdToken();

      // Fetch all offerings and find the one with this id
      const response = await fetch(`${API_BASE_URL}/skills/offerings`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch skill details');
      }

      const offerings = await response.json();
      const found = offerings.find((o: UserSkill) => o.id === id || o.skill_id === id);

      if (!found) {
        throw new Error('Skill not found');
      }

      setUserSkill(found);
    } catch (err) {
      console.error('Error fetching skill:', err);
      setError(err instanceof Error ? err.message : 'Failed to load skill');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!userSkill || !firebaseUser || !user) return;

    // Can't send request to yourself
    if (userSkill.user_id === user.id) {
      alert("You can't send a request to yourself!");
      return;
    }

    setSendingRequest(true);
    try {
      const idToken = await firebaseUser.getIdToken();

      // Send skill-specific request - skill_wanted_id is the skill being viewed
      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiver_id: userSkill.user_id,
          skill_wanted_id: userSkill.skill_id, // The skill current user wants to learn
          message: `Hi! I'm interested in learning ${userSkill.skill.name}. I'd love to exchange skills with you!`
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to send request');
      }

      alert('Match request sent successfully!');
      navigate('/requests');
    } catch (err) {
      console.error('Error sending request:', err);
      alert(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setSendingRequest(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !userSkill) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Link to="/browse" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Browse
          </Link>
          <div className="text-center py-20">
            <p className="text-error mb-4">{error || 'Skill not found'}</p>
            <button onClick={fetchSkillDetail} className="btn-primary py-2 px-4">
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
        {/* Back Button */}
        <Link
          to="/browse"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 flex-shrink-0" />
          Back to Browse
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 text-sm rounded-md bg-primary/10 text-primary">
                  {userSkill.skill.category || 'General'}
                </span>
                <span className="px-3 py-1 text-sm rounded-md bg-accent capitalize">
                  {userSkill.proficiency_level}
                </span>
              </div>
              <h1 className="bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent text-3xl md:text-4xl mb-4">{userSkill.skill.name}</h1>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-primary text-primary flex-shrink-0" />
                  <span className="font-semibold">New</span>
                  <span className="text-muted-foreground">(0 reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>Flexible schedule</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>Remote</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-6 rounded-xl border bg-card">
              <h2 className="text-2xl mb-4">About This Skill</h2>
              <p className="text-muted-foreground leading-relaxed">
                Learn {userSkill.skill.name} from {userSkill.user.name}. 
                This is a {userSkill.proficiency_level} level skill offering in the {userSkill.skill.category || 'General'} category.
              </p>
            </div>

            {/* What You'll Learn */}
            <div className="p-6 rounded-xl border bg-card">
              <h2 className="text-2xl mb-4">What You'll Learn</h2>
              <ul className="space-y-3">
                <li className=" text-black flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Fundamentals of {userSkill.skill.name}</span>
                </li>
                <li className="text-black  flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Best practices and techniques</span>
                </li>
                <li className="text-black flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Hands-on practice and guidance</span>
                </li>
              </ul>
            </div>

            {/* Session Details */}
            <div className="p-6 rounded-xl border bg-card">
              <h2 className="text-2xl mb-4">Session Details</h2>
              <div className="space-y-4">
                <div>
                  <h4 className="mb-1">Format</h4>
                  <p className="text-muted-foreground">One-on-one video sessions</p>
                </div>
                <div>
                  <h4 className="mb-1">Proficiency Level</h4>
                  <p className="text-muted-foreground capitalize">{userSkill.proficiency_level}</p>
                </div>
                <div>
                  <h4 className="mb-1">Availability</h4>
                  <p className="text-muted-foreground">Flexible scheduling</p>
                </div>
              </div>
            </div>

            {/* Reviews Placeholder */}
            <div className="p-6 rounded-xl border bg-card">
              <h2 className="text-2xl mb-6">Reviews</h2>
              <p className="text-muted-foreground text-center py-8">
                No reviews yet. Be the first to swap skills with {userSkill.user.name}!
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Instructor Card */}
              <div className="p-6 rounded-xl border bg-card">
                <h3 className="mb-4">Instructor</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-semibold text-black">
                      {getInitials(userSkill.user.name)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/profile/${userSkill.user.id}`}
                        className="text-black"
                      >
                        {userSkill.user.name}
                      </Link>
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-primary text-primary flex-shrink-0" />
                      <span className=" bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent text-sm">New</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member since</span>
                    <span className="font-medium">{formatMemberSince(userSkill.user.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Seeking */}
              <div className="p-6 rounded-xl border bg-card">
                <h3 className="mb-2">Seeking in Exchange</h3>
                <p className="text-muted-foreground mb-4">Open to skill exchange</p>
                <div className="p-3 rounded-lg bg-accent/50 border border-accent">
                  <p className="text-sm text-muted-foreground">
                    This user is looking to learn new skills in exchange for teaching {userSkill.skill.name}.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={handleSendRequest}
                  disabled={sendingRequest || userSkill.user_id === user?.id}
                  className="inline-flex items-center justify-center gap-2 btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingRequest ? (
                    <>
                      <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-5 w-5 flex-shrink-0" />
                      {userSkill.user_id === user?.id ? 'Your Listing' : 'Send Request'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
