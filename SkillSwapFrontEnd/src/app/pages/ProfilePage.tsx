import { Link } from "react-router";
import { Star, MapPin, Calendar, CheckCircle, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/base/avatar/avatar";

export function ProfilePage() {
  const profile = {
    name: "Alex Thompson",
    username: "alex-thompson",
    avatar: "AT",
    verified: true,
    memberSince: "January 2024",
    location: "San Francisco, CA",
    rating: 4.9,
    totalReviews: 124,
    skillsOffered: 3,
    skillsLearning: 2,
    swapsCompleted: 87,
    bio: "Passionate about web development and helping others learn to code. I've been building web applications for over 5 years and love sharing my knowledge. When I'm not coding, you'll find me learning Spanish or exploring new hiking trails.",
    skills: [
      {
        id: 1,
        title: "Web Development with React",
        category: "Technology",
        level: "Intermediate",
        students: 42,
        rating: 4.9
      },
      {
        id: 2,
        title: "JavaScript Fundamentals",
        category: "Technology",
        level: "Beginner",
        students: 28,
        rating: 5.0
      },
      {
        id: 3,
        title: "Git & Version Control",
        category: "Technology",
        level: "Beginner",
        students: 17,
        rating: 4.8
      }
    ],
    learning: [
      { title: "Spanish Conversation", instructor: "Maria Garcia" },
      { title: "Guitar Fundamentals", instructor: "Jake Wilson" }
    ],
    reviews: [
      {
        id: 1,
        student: "Sarah Miller",
        avatar: "SM",
        rating: 5,
        skill: "Web Development with React",
        date: "2 weeks ago",
        comment: "Alex is an amazing teacher! Very patient and knowledgeable."
      },
      {
        id: 2,
        student: "Mike Johnson",
        avatar: "MJ",
        rating: 5,
        skill: "JavaScript Fundamentals",
        date: "1 month ago",
        comment: "Clear explanations and great examples. Highly recommended!"
      }
    ],
    badges: [
      { name: "Early Adopter", icon: "🌟", description: "Joined in the first year" },
      { name: "Super Swapper", icon: "🔥", description: "Completed 50+ swaps" },
      { name: "5-Star Teacher", icon: "⭐", description: "Maintained 4.8+ rating" },
      { name: "Verified Expert", icon: "✓", description: "Skills verified by community" }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar
              src={undefined}
              alt={profile.name}
              size="2xl"
              initials={profile.avatar}
              verified={profile.verified}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl">{profile.name}</h1>
                {profile.verified && (
                  <CheckCircle className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-semibold text-foreground">{profile.rating}</span>
                  <span>({profile.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Member since {profile.memberSince}</span>
                </div>
              </div>
              <p className="text-muted-foreground max-w-2xl">{profile.bio}</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <MessageSquare className="h-5 w-5" />
              <span>Message</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills Offered */}
            <div>
              <h2 className="text-2xl mb-4">Skills Offered ({profile.skills.length})</h2>
              <div className="space-y-4">
                {profile.skills.map((skill) => (
                  <Link
                    key={skill.id}
                    to={`/skill/${skill.id}`}
                    className="block p-6 rounded-xl border bg-card hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="mb-2">{skill.title}</h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary">
                            {skill.category}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-md bg-accent">
                            {skill.level}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span>{skill.rating}</span>
                      </div>
                      <span>{skill.students} students</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Currently Learning */}
            <div>
              <h2 className="text-2xl mb-4">Currently Learning ({profile.learning.length})</h2>
              <div className="space-y-3">
                {profile.learning.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-card">
                    <h4 className="mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">with {item.instructor}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-2xl mb-4">Recent Reviews</h2>
              <div className="space-y-6">
                {profile.reviews.map((review) => (
                  <div key={review.id} className="p-6 rounded-xl border bg-card">
                    <div className="flex items-start gap-4">
                      <Avatar
                        src={undefined}
                        alt={review.student}
                        size="sm"
                        initials={review.avatar}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{review.student}</p>
                            <p className="text-sm text-muted-foreground">{review.skill}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                          ))}
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
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
                  <span className="text-2xl font-semibold">{profile.skillsOffered}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Skills Learning</span>
                  <span className="text-2xl font-semibold">{profile.skillsLearning}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Swaps Completed</span>
                  <span className="text-2xl font-semibold">{profile.swapsCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Average Rating</span>
                  <span className="text-2xl font-semibold">{profile.rating}</span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="p-6 rounded-xl border bg-card">
              <h3 className="mb-4">Badges & Achievements</h3>
              <div className="grid grid-cols-2 gap-3">
                {profile.badges.map((badge, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border bg-accent/50 text-center"
                    title={badge.description}
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <p className="text-xs font-medium">{badge.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

