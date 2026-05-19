export interface DashboardUser {
  id: string;
  name: string;
  bio: string;
  image: string;
  followers: number;
  posts: number;
  verified: boolean;
  teachSkill: string;
  learnSkill: string;
  offeredSkills: string[];
  wantedSkills: string[];
}

export const MOCK_USERS: DashboardUser[] = [
  {
    id: "1",
    name: "Mia Tanaka",
    bio: "Visual storyteller blending minimalism with bold aesthetics.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop",
    followers: 1847,
    posts: 124,
    verified: true,
    teachSkill: "UI/UX Design",
    learnSkill: "React Development",
    offeredSkills: ["UI/UX Design", "Figma"],
    wantedSkills: ["React", "TypeScript"],
  },
  {
    id: "2",
    name: "James Wilson",
    bio: "Full-stack developer passionate about clean code and scalable systems.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
    followers: 2341,
    posts: 89,
    verified: true,
    teachSkill: "React & TypeScript",
    learnSkill: "UI Design",
    offeredSkills: ["React", "TypeScript", "Node.js"],
    wantedSkills: ["UI/UX", "Figma"],
  },
  // ... add all 6 from previous
  {
    id: "3",
    name: "Emma Chen",
    bio: "Product designer with a focus on accessibility and inclusive design.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop",
    followers: 1567,
    posts: 67,
    verified: false,
    teachSkill: "Figma & Prototyping",
    learnSkill: "Backend Development",
    offeredSkills: ["Figma", "Prototyping"],
    wantedSkills: ["Node.js", "Prisma"],
  },
  {
    id: "4",
    name: "David Kim",
    bio: "Mobile app developer specializing in React Native and Flutter.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
    followers: 3421,
    posts: 201,
    verified: true,
    teachSkill: "Mobile Development",
    learnSkill: "Machine Learning",
    offeredSkills: ["React Native", "Flutter"],
    wantedSkills: ["ML", "Python"],
  },
  {
    id: "5",
    name: "Sarah Johnson",
    bio: "Data scientist with a passion for visualization and storytelling.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop",
    followers: 987,
    posts: 45,
    verified: true,
    teachSkill: "Python & Data Science",
    learnSkill: "Frontend Development",
    offeredSkills: ["Python", "Data Science"],
    wantedSkills: ["React", "Tailwind"],
  },
  {
    id: "6",
    name: "Alex Rivera",
    bio: "DevOps engineer helping teams ship faster with CI/CD pipelines.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
    followers: 1876,
    posts: 112,
    verified: true,
    teachSkill: "DevOps & Cloud",
    learnSkill: "Mobile Development",
    offeredSkills: ["DevOps", "AWS"],
    wantedSkills: ["React Native"],
  },
];

export const SKILL_TAGS = [
  "UI/UX Design",
  "React",
  "TypeScript",
  "Python",
  "Mobile Dev",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "Figma",
  "Node.js",
] as const;
