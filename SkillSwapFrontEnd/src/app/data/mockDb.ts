/**
 * Comprehensive Mock Database for SkillSwap Application
 *
 * This file contains rich mock data for all features including:
 * - Users with complete profiles
 * - Skills catalog by category
 * - Gamification data (XP, levels, achievements, streaks)
 * - Sessions (scheduled, in-progress, completed)
 * - Ratings and reviews
 * - Leaderboard data
 * - Helper functions for dynamic data generation
 */

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Generate a relative timestamp (e.g., "2h ago", "1d ago")
 */
export const getRelativeTime = (hoursAgo: number): string => {
  if (hoursAgo < 1) return "Just now";
  if (hoursAgo < 24) return `${Math.floor(hoursAgo)}h ago`;
  if (hoursAgo < 48) return "1d ago";
  if (hoursAgo < 168) return `${Math.floor(hoursAgo / 24)}d ago`;
  return `${Math.floor(hoursAgo / 168)}w ago`;
};

/**
 * Generate a Date object for a specific time ago
 */
export const getDateAgo = (hoursAgo: number): Date => {
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
};

/**
 * Generate a random avatar URL
 */
export const getAvatarUrl = (seed: string): string => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
};

// ==========================================
// SKILLS CATALOG
// ==========================================

export const skillsCatalog = [
  // Programming
  { id: "js", name: "JavaScript", category: "Programming", icon: "Code" },
  { id: "ts", name: "TypeScript", category: "Programming", icon: "Code" },
  { id: "python", name: "Python", category: "Programming", icon: "Terminal" },
  { id: "java", name: "Java", category: "Programming", icon: "Coffee" },
  { id: "cpp", name: "C++", category: "Programming", icon: "Cpu" },
  { id: "go", name: "Go", category: "Programming", icon: "Server" },
  { id: "rust", name: "Rust", category: "Programming", icon: "Shield" },

  // Frontend
  { id: "react", name: "React", category: "Frontend", icon: "Atom" },
  { id: "vue", name: "Vue.js", category: "Frontend", icon: "Layers" },
  { id: "angular", name: "Angular", category: "Frontend", icon: "Triangle" },
  { id: "nextjs", name: "Next.js", category: "Frontend", icon: "Zap" },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    category: "Frontend",
    icon: "Palette",
  },
  { id: "html", name: "HTML/CSS", category: "Frontend", icon: "Layout" },

  // Backend
  { id: "nodejs", name: "Node.js", category: "Backend", icon: "Server" },
  { id: "django", name: "Django", category: "Backend", icon: "Globe" },
  { id: "spring", name: "Spring Boot", category: "Backend", icon: "Leaf" },
  { id: "graphql", name: "GraphQL", category: "Backend", icon: "Share2" },
  {
    id: "microservices",
    name: "Microservices",
    category: "Backend",
    icon: "Grid",
  },

  // Database
  { id: "sql", name: "SQL", category: "Database", icon: "Database" },
  { id: "mongodb", name: "MongoDB", category: "Database", icon: "Leaf" },
  {
    id: "postgres",
    name: "PostgreSQL",
    category: "Database",
    icon: "Database",
  },
  { id: "redis", name: "Redis", category: "Database", icon: "Layers" },

  // DevOps
  { id: "docker", name: "Docker", category: "DevOps", icon: "Box" },
  { id: "k8s", name: "Kubernetes", category: "DevOps", icon: "Hexagon" },
  { id: "aws", name: "AWS", category: "DevOps", icon: "Cloud" },
  { id: "ci-cd", name: "CI/CD", category: "DevOps", icon: "GitBranch" },

  // Design
  { id: "figma", name: "Figma", category: "Design", icon: "PenTool" },
  { id: "ui-ux", name: "UI/UX Design", category: "Design", icon: "Layout" },
  { id: "photoshop", name: "Photoshop", category: "Design", icon: "Image" },
  {
    id: "illustrator",
    name: "Illustrator",
    category: "Design",
    icon: "PenTool",
  },

  // Data Science
  {
    id: "ml",
    name: "Machine Learning",
    category: "Data Science",
    icon: "Brain",
  },
  {
    id: "data-analysis",
    name: "Data Analysis",
    category: "Data Science",
    icon: "BarChart",
  },
  {
    id: "tensorflow",
    name: "TensorFlow",
    category: "Data Science",
    icon: "Brain",
  },
  { id: "pytorch", name: "PyTorch", category: "Data Science", icon: "Flame" },

  // Languages
  {
    id: "spanish",
    name: "Spanish",
    category: "Language",
    icon: "MessageCircle",
  },
  { id: "french", name: "French", category: "Language", icon: "MessageCircle" },
  { id: "german", name: "German", category: "Language", icon: "MessageCircle" },
  {
    id: "japanese",
    name: "Japanese",
    category: "Language",
    icon: "MessageCircle",
  },
  {
    id: "mandarin",
    name: "Mandarin",
    category: "Language",
    icon: "MessageCircle",
  },

  // Creative
  {
    id: "photography",
    name: "Photography",
    category: "Creative",
    icon: "Camera",
  },
  {
    id: "video-editing",
    name: "Video Editing",
    category: "Creative",
    icon: "Video",
  },
  { id: "guitar", name: "Guitar", category: "Creative", icon: "Music" },
  { id: "piano", name: "Piano", category: "Creative", icon: "Music" },
  { id: "drawing", name: "Drawing", category: "Creative", icon: "PenTool" },

  // Soft Skills
  {
    id: "public-speaking",
    name: "Public Speaking",
    category: "Soft Skills",
    icon: "Mic",
  },
  {
    id: "leadership",
    name: "Leadership",
    category: "Soft Skills",
    icon: "Users",
  },
  {
    id: "negotiation",
    name: "Negotiation",
    category: "Soft Skills",
    icon: "Handshake",
  },
  {
    id: "time-management",
    name: "Time Management",
    category: "Soft Skills",
    icon: "Clock",
  },

  // Health & Lifestyle
  { id: "yoga", name: "Yoga", category: "Health", icon: "Heart" },
  {
    id: "fitness",
    name: "Fitness Training",
    category: "Health",
    icon: "Dumbbell",
  },
  { id: "cooking", name: "Cooking", category: "Lifestyle", icon: "Utensils" },
  {
    id: "meditation",
    name: "Meditation",
    category: "Health",
    icon: "Sparkles",
  },
];

// ==========================================
// USERS
// ==========================================

export const mockUsers = [
  {
    id: "user-1",
    name: "Arjun Desai",
    email: "arjun.desai@example.com",
    avatar: getAvatarUrl("arjun"),
    profileCompletion: 85,
    isVerified: true,
    createdAt: getDateAgo(720), // 30 days ago
    bio: "Full-stack developer passionate about teaching JavaScript and React. Looking to learn Python and ML!",
    location: "Mumbai, India",
    offeredSkills: ["JavaScript", "React", "Node.js", "TypeScript"],
    wantedSkills: ["Python", "Machine Learning", "System Design"],
  },
  {
    id: "user-2",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    avatar: getAvatarUrl("priya"),
    profileCompletion: 92,
    isVerified: true,
    createdAt: getDateAgo(504), // 21 days ago
    bio: "Data scientist with expertise in Python and ML. Want to improve my frontend skills!",
    location: "Bangalore, India",
    offeredSkills: ["Python", "Machine Learning", "SQL", "Data Analysis"],
    wantedSkills: ["JavaScript", "React", "UI/UX Design"],
  },
  {
    id: "user-3",
    name: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    avatar: getAvatarUrl("aarav"),
    profileCompletion: 78,
    isVerified: true,
    createdAt: getDateAgo(336), // 14 days ago
    bio: "Backend engineer specializing in Java and Spring Boot. Looking to learn frontend development.",
    location: "Delhi, India",
    offeredSkills: ["Java", "Spring Boot", "Microservices", "SQL"],
    wantedSkills: ["DSA", "React", "JavaScript"],
  },
  {
    id: "user-4",
    name: "Ananya Reddy",
    email: "ananya.reddy@example.com",
    avatar: getAvatarUrl("ananya"),
    profileCompletion: 88,
    isVerified: false,
    createdAt: getDateAgo(168), // 7 days ago
    bio: "Full-stack Python developer. Love teaching Django and PostgreSQL!",
    location: "Hyderabad, India",
    offeredSkills: ["Python", "Django", "PostgreSQL", "Docker"],
    wantedSkills: ["React", "TypeScript", "AWS"],
  },
  {
    id: "user-5",
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    avatar: getAvatarUrl("vikram"),
    profileCompletion: 70,
    isVerified: true,
    createdAt: getDateAgo(240), // 10 days ago
    bio: "Creative professional with expertise in video production. Want to learn web development!",
    location: "Pune, India",
    offeredSkills: [
      "Photography",
      "Video Editing",
      "Adobe Premiere",
      "Photoshop",
    ],
    wantedSkills: ["JavaScript", "Web Development", "React"],
  },
  {
    id: "user-6",
    name: "Riya Kapoor",
    email: "riya.kapoor@example.com",
    avatar: getAvatarUrl("riya"),
    profileCompletion: 95,
    isVerified: true,
    createdAt: getDateAgo(600), // 25 days ago
    bio: "Senior Java developer with 8 years of experience. Looking for frontend mentors!",
    location: "Chennai, India",
    offeredSkills: ["Java", "Spring Boot", "Microservices", "Kubernetes"],
    wantedSkills: ["React", "Frontend Development", "TypeScript"],
  },
  {
    id: "user-7",
    name: "Rohan Gupta",
    email: "rohan.gupta@example.com",
    avatar: getAvatarUrl("rohan"),
    profileCompletion: 65,
    isVerified: false,
    createdAt: getDateAgo(120), // 5 days ago
    bio: "Competitive programmer and DSA enthusiast. Want to learn full-stack development.",
    location: "Kolkata, India",
    offeredSkills: ["DSA", "Competitive Programming", "C++", "Java"],
    wantedSkills: ["Web Development", "Node.js", "React"],
  },
  {
    id: "user-8",
    name: "Lakshmi Iyer",
    email: "lakshmi.iyer@example.com",
    avatar: getAvatarUrl("lakshmi"),
    profileCompletion: 80,
    isVerified: true,
    createdAt: getDateAgo(432), // 18 days ago
    bio: "Music teacher and UI/UX designer. Love sharing knowledge about design and music!",
    location: "Bangalore, India",
    offeredSkills: ["UI/UX Design", "Figma", "Guitar", "Music Theory"],
    wantedSkills: ["Piano", "Singing", "JavaScript"],
  },
];

// Current user (logged in user)
export const currentUser = mockUsers[0];

// ==========================================
// MATCHES
// ==========================================

export const mockMatches = [
  {
    id: "match-1",
    userId: "user-2",
    name: "Priya Sharma",
    avatar: mockUsers[1].avatar,
    matchScore: 92,
    offeredSkills: ["Python", "Machine Learning", "SQL"],
    wantedSkills: ["JavaScript", "React"],
    isOnline: true,
    lastActive: getDateAgo(0.5),
    mutualSkills: 4,
    bio: mockUsers[1].bio,
  },
  {
    id: "match-2",
    userId: "user-3",
    name: "Aarav Mehta",
    avatar: mockUsers[2].avatar,
    matchScore: 88,
    offeredSkills: ["Java", "Spring Boot", "Microservices"],
    wantedSkills: ["DSA", "React"],
    isOnline: true,
    lastActive: getDateAgo(2),
    mutualSkills: 3,
    bio: mockUsers[2].bio,
  },
  {
    id: "match-3",
    userId: "user-6",
    name: "Riya Kapoor",
    avatar: mockUsers[5].avatar,
    matchScore: 85,
    offeredSkills: ["Java", "Spring Boot", "Kubernetes"],
    wantedSkills: ["React", "Frontend Development"],
    isOnline: false,
    lastActive: getDateAgo(5),
    mutualSkills: 3,
    bio: mockUsers[5].bio,
  },
  {
    id: "match-4",
    userId: "user-8",
    name: "Lakshmi Iyer",
    avatar: mockUsers[7].avatar,
    matchScore: 78,
    offeredSkills: ["UI/UX Design", "Figma", "Guitar"],
    wantedSkills: ["Piano", "Singing"],
    isOnline: false,
    lastActive: getDateAgo(12),
    mutualSkills: 2,
    bio: mockUsers[7].bio,
  },
  {
    id: "match-5",
    userId: "user-7",
    name: "Rohan Gupta",
    avatar: mockUsers[6].avatar,
    matchScore: 82,
    offeredSkills: ["DSA", "Competitive Programming"],
    wantedSkills: ["Web Development", "Node.js"],
    isOnline: true,
    lastActive: getDateAgo(0.2),
    mutualSkills: 3,
    bio: mockUsers[6].bio,
  },
];

// ==========================================
// MATCH REQUESTS
// ==========================================

export const mockIncomingRequests = [
  {
    id: "req-1",
    userId: "user-6",
    name: "Riya Kapoor",
    avatar: mockUsers[5].avatar,
    offeredSkills: ["Java", "Spring Boot", "Microservices"],
    wantedSkills: ["React", "Frontend Development"],
    timestamp: getRelativeTime(2),
    sentAt: getDateAgo(2),
    message:
      "Hi! I'd love to learn React from you. I can teach you Spring Boot in exchange!",
  },
  {
    id: "req-2",
    userId: "user-5",
    name: "Vikram Singh",
    avatar: mockUsers[4].avatar,
    offeredSkills: ["Photography", "Video Editing", "Adobe Premiere"],
    wantedSkills: ["JavaScript", "Web Development"],
    timestamp: getRelativeTime(5),
    sentAt: getDateAgo(5),
    message:
      "Hey! I'm interested in learning web development. I can teach you video editing!",
  },
];

export const mockSentRequests = [
  {
    id: "req-3",
    userId: "user-4",
    name: "Ananya Reddy",
    avatar: mockUsers[3].avatar,
    offeredSkills: ["Python", "Django", "PostgreSQL"],
    wantedSkills: ["React", "TypeScript"],
    timestamp: getRelativeTime(24),
    sentAt: getDateAgo(24),
    status: "pending",
    message:
      "Hi Ananya! Would love to learn Python from you. I can help with React!",
  },
];

export const mockAcceptedMatches = [
  {
    id: "accepted-1",
    userId: "user-2",
    name: "Priya Sharma",
    avatar: mockUsers[1].avatar,
    lastMessage: "Great! When can we start the first session?",
    timestamp: getRelativeTime(2),
    sentAt: getDateAgo(2),
    unread: 2,
    isOnline: true,
  },
  {
    id: "accepted-2",
    userId: "user-3",
    name: "Aarav Mehta",
    avatar: mockUsers[2].avatar,
    lastMessage: "Thanks for accepting! Looking forward to learning React.",
    timestamp: getRelativeTime(26),
    sentAt: getDateAgo(26),
    unread: 0,
    isOnline: true,
  },
];

// ==========================================
// MESSAGES
// ==========================================

export const mockMessages: Record<
  string,
  Array<{
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
    status: "sent" | "delivered" | "seen";
    type?: "text" | "image" | "file";
    attachments?: Array<{ name: string; url: string; type: string }>;
  }>
> = {
  "user-2": [
    {
      id: "msg-1",
      senderId: "user-2",
      text: "Hi! I saw we matched on JavaScript and React skills. I'd love to learn from you!",
      timestamp: getDateAgo(48),
      status: "seen",
    },
    {
      id: "msg-2",
      senderId: "user-1",
      text: "Hey Priya! Sure, I'd be happy to help. What specifically are you looking to learn?",
      timestamp: getDateAgo(47),
      status: "seen",
    },
    {
      id: "msg-3",
      senderId: "user-2",
      text: "I want to improve my React skills. I know the basics but need help with hooks and context.",
      timestamp: getDateAgo(46),
      status: "seen",
    },
    {
      id: "msg-4",
      senderId: "user-1",
      text: "Perfect! I can definitely help with that. In exchange, I'd love to learn Python for data analysis.",
      timestamp: getDateAgo(45),
      status: "seen",
    },
    {
      id: "msg-5",
      senderId: "user-2",
      text: "Deal! I can teach you pandas and numpy. When are you free for our first session?",
      timestamp: getDateAgo(44),
      status: "seen",
    },
    {
      id: "msg-6",
      senderId: "user-1",
      text: "How about this Saturday at 2 PM?",
      timestamp: getDateAgo(3),
      status: "seen",
    },
    {
      id: "msg-7",
      senderId: "user-2",
      text: "Saturday works for me! Should we do a video call?",
      timestamp: getDateAgo(2.5),
      status: "seen",
    },
    {
      id: "msg-8",
      senderId: "user-1",
      text: "Yes, let's use Google Meet. I'll send you the link before the session.",
      timestamp: getDateAgo(2.2),
      status: "seen",
    },
    {
      id: "msg-9",
      senderId: "user-2",
      text: "Great! When can we start the first session?",
      timestamp: getDateAgo(2),
      status: "delivered",
    },
  ],
  "user-3": [
    {
      id: "msg-10",
      senderId: "user-3",
      text: "Hello! I'm interested in learning React from you. Would you be open to a skill swap?",
      timestamp: getDateAgo(72),
      status: "seen",
    },
    {
      id: "msg-11",
      senderId: "user-1",
      text: "Hi Aarav! Absolutely, I'd love to learn Java and Spring Boot from you in exchange.",
      timestamp: getDateAgo(71),
      status: "seen",
    },
    {
      id: "msg-12",
      senderId: "user-3",
      text: "Thanks for accepting! Looking forward to learning React. I have some experience with JavaScript.",
      timestamp: getDateAgo(27),
      status: "seen",
    },
    {
      id: "msg-13",
      senderId: "user-1",
      text: "Awesome! Let's schedule our first session soon.",
      timestamp: getDateAgo(26),
      status: "seen",
    },
  ],
};

// ==========================================
// GAMIFICATION - XP & LEVELS
// ==========================================

export const LEVEL_THRESHOLDS = [
  { level: 1, minXP: 0, title: "Novice", color: "#64748b", icon: "Seedling" },
  {
    level: 2,
    minXP: 100,
    title: "Apprentice",
    color: "#10b981",
    icon: "Sprout",
  },
  {
    level: 3,
    minXP: 300,
    title: "Practitioner",
    color: "#3b82f6",
    icon: "TreePine",
  },
  { level: 4, minXP: 600, title: "Expert", color: "#8b5cf6", icon: "Award" },
  { level: 5, minXP: 1000, title: "Master", color: "#f59e0b", icon: "Crown" },
  {
    level: 6,
    minXP: 2000,
    title: "Grandmaster",
    color: "#ef4444",
    icon: "Trophy",
  },
];

export const getLevelInfo = (xp: number) => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].minXP) {
      const nextLevel = LEVEL_THRESHOLDS[i + 1];
      return {
        ...LEVEL_THRESHOLDS[i],
        nextLevelXP: nextLevel?.minXP || null,
        progress: nextLevel
          ? ((xp - LEVEL_THRESHOLDS[i].minXP) /
              (nextLevel.minXP - LEVEL_THRESHOLDS[i].minXP)) *
            100
          : 100,
      };
    }
  }
  return LEVEL_THRESHOLDS[0];
};

export const mockGamification = {
  currentUser: {
    xp: 485,
    level: getLevelInfo(485),
    totalXP: 485,
  },

  xpTransactions: [
    {
      id: "xp-1",
      action: "ADD_SKILL",
      amount: 50,
      description: "Added JavaScript skill",
      createdAt: getDateAgo(720),
    },
    {
      id: "xp-2",
      action: "ADD_SKILL",
      amount: 50,
      description: "Added React skill",
      createdAt: getDateAgo(720),
    },
    {
      id: "xp-3",
      action: "ADD_SKILL",
      amount: 50,
      description: "Added Node.js skill",
      createdAt: getDateAgo(720),
    },
    {
      id: "xp-4",
      action: "FIRST_MATCH",
      amount: 100,
      description: "Found first skill partner",
      createdAt: getDateAgo(504),
    },
    {
      id: "xp-5",
      action: "COMPLETE_SESSION",
      amount: 100,
      description: "Completed skill swap session with Priya",
      createdAt: getDateAgo(168),
    },
    {
      id: "xp-6",
      action: "TEACH_SKILL",
      amount: 30,
      description: "Taught React hooks",
      createdAt: getDateAgo(168),
    },
    {
      id: "xp-7",
      action: "RECEIVE_RATING",
      amount: 20,
      description: "Received 5-star rating",
      createdAt: getDateAgo(120),
    },
    {
      id: "xp-8",
      action: "STREAK_BONUS",
      amount: 10,
      description: "7-day streak bonus",
      createdAt: getDateAgo(48),
    },
    {
      id: "xp-9",
      action: "COMPLETE_SESSION",
      amount: 100,
      description: "Completed session with Aarav",
      createdAt: getDateAgo(24),
    },
  ],

  achievements: [
    {
      id: "first_skill",
      title: "First Skill",
      description: "Added your first skill",
      icon: "Target",
      unlocked: true,
      unlockedAt: getDateAgo(720),
    },
    {
      id: "skill_collector",
      title: "Skill Collector",
      description: "Added 5+ skills to your profile",
      icon: "Award",
      unlocked: true,
      unlockedAt: getDateAgo(700),
    },
    {
      id: "first_match",
      title: "First Match",
      description: "Found your first skill partner",
      icon: "Heart",
      unlocked: true,
      unlockedAt: getDateAgo(504),
    },
    {
      id: "social_butterfly",
      title: "Social Butterfly",
      description: "Made 10+ matches",
      icon: "Users",
      unlocked: false,
      progress: 20,
      target: 10,
    },
    {
      id: "teacher",
      title: "Teacher",
      description: "Taught 3+ skills to others",
      icon: "GraduationCap",
      unlocked: false,
      progress: 1,
      target: 3,
    },
    {
      id: "quick_learner",
      title: "Quick Learner",
      description: "Learned 3+ skills in a month",
      icon: "Zap",
      unlocked: false,
      progress: 1,
      target: 3,
    },
    {
      id: "streak_7",
      title: "7-Day Streak",
      description: "Active for 7 days straight",
      icon: "Flame",
      unlocked: true,
      unlockedAt: getDateAgo(48),
    },
    {
      id: "streak_30",
      title: "Monthly Master",
      description: "Active for 30 days straight",
      icon: "Calendar",
      unlocked: false,
      progress: 7,
      target: 30,
    },
    {
      id: "top_rated",
      title: "Top Rated",
      description: "Maintained 4.5+ rating with 5+ reviews",
      icon: "Star",
      unlocked: false,
      progress: 2,
      target: 5,
    },
    {
      id: "session_master",
      title: "Session Master",
      description: "Completed 20+ skill swap sessions",
      icon: "Trophy",
      unlocked: false,
      progress: 2,
      target: 20,
    },
    {
      id: "verified",
      title: "Verified",
      description: "Completed profile verification",
      icon: "CheckCircle",
      unlocked: true,
      unlockedAt: getDateAgo(700),
    },
    {
      id: "xp_1000",
      title: "XP Champion",
      description: "Earned 1000+ XP",
      icon: "Crown",
      unlocked: false,
      progress: 485,
      target: 1000,
    },
  ],

  streak: {
    current: 7,
    longest: 7,
    lastActive: getDateAgo(0.5),
    nextMilestone: 14,
    daysUntilNextMilestone: 7,
  },

  stats: {
    totalSkills: 4,
    totalMatches: 2,
    skillsTaught: 1,
    skillsLearnedThisMonth: 1,
    completedSessions: 2,
    averageRating: 5.0,
    totalRatings: 2,
  },
};

// ==========================================
// SESSIONS
// ==========================================

export const mockSessions = [
  {
    id: "session-1",
    teacherId: "user-1",
    teacherName: "Arjun Desai",
    learnerId: "user-2",
    learnerName: "Priya Sharma",
    skillTaught: "React Hooks & Context",
    skillLearned: "Python Pandas Basics",
    status: "completed",
    scheduledAt: getDateAgo(168),
    completedAt: getDateAgo(168),
    duration: 60, // minutes
    rating: {
      teacherRating: 5,
      learnerRating: 5,
      teacherReview:
        "Priya was an excellent student! She picked up React hooks very quickly.",
      learnerReview:
        "Arjun explained Python concepts so clearly. Highly recommended!",
    },
  },
  {
    id: "session-2",
    teacherId: "user-3",
    teacherName: "Aarav Mehta",
    learnerId: "user-1",
    learnerName: "Arjun Desai",
    skillTaught: "Spring Boot Basics",
    skillLearned: "Advanced React Patterns",
    status: "completed",
    scheduledAt: getDateAgo(24),
    completedAt: getDateAgo(24),
    duration: 90,
    rating: {
      teacherRating: 5,
      learnerRating: 4,
      teacherReview:
        "Great session! Arjun helped me understand React patterns deeply.",
      learnerReview: "Aarav knows Java very well. Good teaching style.",
    },
  },
  {
    id: "session-3",
    teacherId: "user-1",
    teacherName: "Arjun Desai",
    learnerId: "user-2",
    learnerName: "Priya Sharma",
    skillTaught: "TypeScript Fundamentals",
    skillLearned: "Machine Learning Intro",
    status: "scheduled",
    scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days from now
    duration: 60,
    meetingLink: "https://meet.google.com/abc-defg-hij",
    notes: "We'll cover TypeScript basics and ML introduction",
  },
  {
    id: "session-4",
    teacherId: "user-6",
    teacherName: "Riya Kapoor",
    learnerId: "user-1",
    learnerName: "Arjun Desai",
    skillTaught: "Kubernetes Basics",
    skillLearned: "React Performance Optimization",
    status: "in_progress",
    scheduledAt: getDateAgo(0.5),
    startedAt: getDateAgo(0.5),
    duration: 120,
    meetingLink: "https://meet.google.com/xyz-1234-abc",
  },
];

// ==========================================
// RATINGS & REVIEWS
// ==========================================

export const mockRatings = {
  received: [
    {
      id: "rating-1",
      fromUserId: "user-2",
      fromUserName: "Priya Sharma",
      fromUserAvatar: mockUsers[1].avatar,
      sessionId: "session-1",
      rating: 5,
      comment:
        "Arjun is an amazing teacher! He explained React concepts so clearly and patiently. I feel much more confident now.",
      createdAt: getDateAgo(168),
      skillsTaught: ["React Hooks", "Context API"],
    },
    {
      id: "rating-2",
      fromUserId: "user-3",
      fromUserName: "Aarav Mehta",
      fromUserAvatar: mockUsers[2].avatar,
      sessionId: "session-2",
      rating: 5,
      comment:
        "Excellent session! Arjun helped me understand advanced React patterns. Very knowledgeable and friendly.",
      createdAt: getDateAgo(24),
      skillsTaught: ["Advanced React", "Performance Optimization"],
    },
  ],
  given: [
    {
      id: "rating-3",
      toUserId: "user-2",
      toUserName: "Priya Sharma",
      toUserAvatar: mockUsers[1].avatar,
      sessionId: "session-1",
      rating: 5,
      comment:
        "Priya was a great student! She asked thoughtful questions and picked up Python quickly.",
      createdAt: getDateAgo(168),
      skillsLearned: ["Python Pandas", "Data Analysis"],
    },
    {
      id: "rating-4",
      toUserId: "user-3",
      toUserName: "Aarav Mehta",
      toUserAvatar: mockUsers[2].avatar,
      sessionId: "session-2",
      rating: 4,
      comment:
        "Aarav has deep knowledge of Java and Spring Boot. Good teaching pace.",
      createdAt: getDateAgo(24),
      skillsLearned: ["Spring Boot", "Java Basics"],
    },
  ],
};

// ==========================================
// LEADERBOARD
// ==========================================

export const mockLeaderboard = [
  {
    rank: 1,
    id: "user-10",
    name: "Neha Patel",
    avatar: getAvatarUrl("neha"),
    xp: 2450,
    level: getLevelInfo(2450),
    totalSkills: 8,
  },
  {
    rank: 2,
    id: "user-11",
    name: "Karan Malhotra",
    avatar: getAvatarUrl("karan"),
    xp: 1890,
    level: getLevelInfo(1890),
    totalSkills: 7,
  },
  {
    rank: 3,
    id: "user-12",
    name: "Sneha Rao",
    avatar: getAvatarUrl("sneha"),
    xp: 1520,
    level: getLevelInfo(1520),
    totalSkills: 6,
  },
  {
    rank: 4,
    id: "user-2",
    name: "Priya Sharma",
    avatar: mockUsers[1].avatar,
    xp: 1200,
    level: getLevelInfo(1200),
    totalSkills: 4,
  },
  {
    rank: 5,
    id: "user-1",
    name: "Arjun Desai",
    avatar: mockUsers[0].avatar,
    xp: 485,
    level: getLevelInfo(485),
    totalSkills: 4,
  },
  {
    rank: 6,
    id: "user-3",
    name: "Aarav Mehta",
    avatar: mockUsers[2].avatar,
    xp: 380,
    level: getLevelInfo(380),
    totalSkills: 4,
  },
  {
    rank: 7,
    id: "user-6",
    name: "Riya Kapoor",
    avatar: mockUsers[5].avatar,
    xp: 320,
    level: getLevelInfo(320),
    totalSkills: 4,
  },
  {
    rank: 8,
    id: "user-4",
    name: "Ananya Reddy",
    avatar: mockUsers[3].avatar,
    xp: 280,
    level: getLevelInfo(280),
    totalSkills: 4,
  },
  {
    rank: 9,
    id: "user-8",
    name: "Lakshmi Iyer",
    avatar: mockUsers[7].avatar,
    xp: 210,
    level: getLevelInfo(210),
    totalSkills: 4,
  },
  {
    rank: 10,
    id: "user-5",
    name: "Vikram Singh",
    avatar: mockUsers[4].avatar,
    xp: 150,
    level: getLevelInfo(150),
    totalSkills: 4,
  },
];

// ==========================================
// NOTIFICATIONS
// ==========================================

export const mockNotifications = [
  {
    id: "notif-1",
    type: "match_request",
    title: "New Match Request",
    message: "Riya Kapoor wants to connect with you",
    userId: "user-6",
    userName: "Riya Kapoor",
    userAvatar: mockUsers[5].avatar,
    read: false,
    createdAt: getDateAgo(2),
  },
  {
    id: "notif-2",
    type: "match_accepted",
    title: "Match Accepted!",
    message: "Priya Sharma accepted your match request",
    userId: "user-2",
    userName: "Priya Sharma",
    userAvatar: mockUsers[1].avatar,
    read: true,
    createdAt: getDateAgo(48),
  },
  {
    id: "notif-3",
    type: "session_reminder",
    title: "Upcoming Session",
    message: "Session with Priya Sharma in 2 hours",
    userId: "user-2",
    userName: "Priya Sharma",
    userAvatar: mockUsers[1].avatar,
    read: false,
    createdAt: getDateAgo(2),
  },
  {
    id: "notif-4",
    type: "xp_earned",
    title: "XP Earned!",
    message: "You earned 100 XP for completing a session",
    amount: 100,
    read: true,
    createdAt: getDateAgo(24),
  },
  {
    id: "notif-5",
    type: "achievement_unlocked",
    title: "Achievement Unlocked!",
    message: "You unlocked the '7-Day Streak' achievement",
    achievementId: "streak_7",
    read: true,
    createdAt: getDateAgo(48),
  },
  {
    id: "notif-6",
    type: "new_message",
    title: "New Message",
    message: "Aarav Mehta sent you a message",
    userId: "user-3",
    userName: "Aarav Mehta",
    userAvatar: mockUsers[2].avatar,
    read: false,
    createdAt: getDateAgo(0.5),
  },
];

// ==========================================
// ANALYTICS & INSIGHTS
// ==========================================

export const mockAnalytics = {
  learningProgress: {
    skillsLearned: [
      {
        skill: "Python Pandas",
        progress: 75,
        startedAt: getDateAgo(168),
        estimatedCompletion: "2 weeks",
      },
      {
        skill: "Spring Boot",
        progress: 40,
        startedAt: getDateAgo(24),
        estimatedCompletion: "1 month",
      },
      {
        skill: "Machine Learning",
        progress: 15,
        startedAt: getDateAgo(48),
        estimatedCompletion: "3 months",
      },
    ],
    skillsTaught: [
      { skill: "React Hooks", students: 2, sessions: 3, totalHours: 4 },
      { skill: "TypeScript", students: 1, sessions: 1, totalHours: 1.5 },
    ],
    totalLearningHours: 12.5,
    totalTeachingHours: 5.5,
  },

  weeklyActivity: [
    { day: "Mon", sessions: 2, xpEarned: 150 },
    { day: "Tue", sessions: 1, xpEarned: 80 },
    { day: "Wed", sessions: 0, xpEarned: 30 },
    { day: "Thu", sessions: 1, xpEarned: 100 },
    { day: "Fri", sessions: 2, xpEarned: 180 },
    { day: "Sat", sessions: 1, xpEarned: 50 },
    { day: "Sun", sessions: 0, xpEarned: 20 },
  ],

  skillCategories: [
    { category: "Programming", count: 8, percentage: 25 },
    { category: "Frontend", count: 6, percentage: 19 },
    { category: "Backend", count: 5, percentage: 16 },
    { category: "Database", count: 4, percentage: 12 },
    { category: "Design", count: 3, percentage: 9 },
    { category: "Data Science", count: 3, percentage: 9 },
    { category: "DevOps", count: 2, percentage: 6 },
    { category: "Other", count: 1, percentage: 4 },
  ],
};

// ==========================================
// EXPORT ALL MOCK DATA
// ==========================================

export const mockDb = {
  users: mockUsers,
  currentUser,
  matches: mockMatches,
  incomingRequests: mockIncomingRequests,
  sentRequests: mockSentRequests,
  acceptedMatches: mockAcceptedMatches,
  messages: mockMessages,
  skills: skillsCatalog,
  gamification: mockGamification,
  sessions: mockSessions,
  ratings: mockRatings,
  leaderboard: mockLeaderboard,
  notifications: mockNotifications,
  analytics: mockAnalytics,
};

export default mockDb;
