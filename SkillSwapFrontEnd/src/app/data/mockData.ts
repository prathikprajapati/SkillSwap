export const mockMatches = [
  {
    id: "1",
    name: "Aarav Mehta",
    avatar:
      "https://images.unsplash.com/photo-1649433658557-54cf58577c68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwcm9mZXNzaW9uYWwlMjBtYW58ZW58MXx8fHwxNzcwMDYzOTE3fDA&ixlib=rb-4.1.0&q=80&w=400",
    matchScore: 92,
    offeredSkills: ["Java", "System Design", "Spring Boot"],
    wantedSkills: ["DSA", "React"],
    isOnline: true,
  },
  {
    id: "2",
    name: "Priya Sharma",
    avatar:
      "https://images.unsplash.com/photo-1581065178026-390bc4e78dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHdvbWFuJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MDAzODM3MHww&ixlib=rb-4.1.0&q=80&w=400",
    matchScore: 88,
    offeredSkills: ["Python", "Machine Learning", "SQL"],
    wantedSkills: ["JavaScript", "React"],
    isOnline: true,
  },
  {
    id: "3",
    name: "James Wilson",
    avatar:
      "https://images.unsplash.com/photo-1656313826909-1f89d1702a81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcwMDE4MDQ4fDA&ixlib=rb-4.1.0&q=80&w=400",
    matchScore: 85,
    offeredSkills: ["Photoshop", "UI/UX Design", "Figma"],
    wantedSkills: ["HTML", "CSS"],
    isOnline: false,
  },
  {
    id: "4",
    name: "Lakshmi Iyer",
    avatar:
      "https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHBlcnNvbiUyMGhlYWRzaG90fGVufDF8fHx8MTc3MDA1Njc2NXww&ixlib=rb-4.1.0&q=80&w=400",
    matchScore: 78,
    offeredSkills: ["Guitar", "Music Theory"],
    wantedSkills: ["Piano", "Singing"],
    isOnline: false,
  },
  {
    id: "5",
    name: "Rohan Gupta",
    avatar:
      "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDA3MzA5MXww&ixlib=rb-4.1.0&q=80&w=400",
    matchScore: 82,
    offeredSkills: ["DSA", "Competitive Programming"],
    wantedSkills: ["Web Development", "Node.js"],
    isOnline: true,
  },
];

export const currentUser = {
  id: "current-user",
  name: "Arjun Desai",
  email: "arjun.desai@example.com",
  offeredSkills: ["JavaScript", "React", "Node.js", "MongoDB"],
  wantedSkills: ["Python", "Machine Learning", "System Design"],
  profileCompletion: 75,
};

export const mockIncomingRequests = [
  {
    id: "1",
    name: "Riya Kapoor",
    avatar:
      "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDA3MzA5MXww&ixlib=rb-4.1.0&q=80&w=400",
    offeredSkills: ["Java", "Spring Boot", "Microservices"],
    wantedSkills: ["React", "Frontend Development"],
    timestamp: "2h ago",
  },
  {
    id: "2",
    name: "Vikram Singh",
    avatar:
      "https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwxfHx8fDE3NzAwODY3MDN8MA&ixlib=rb-4.1.0&q=80&w=400",
    offeredSkills: ["Photography", "Video Editing", "Adobe Premiere"],
    wantedSkills: ["JavaScript", "Web Development"],
    timestamp: "5h ago",
  },
];

export const mockSentRequests = [
  {
    id: "1",
    name: "Ananya Reddy",
    avatar:
      "https://images.unsplash.com/photo-1683815251677-8df20f826622?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwZXJzb24lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzAwODY5NDh8MA&ixlib=rb-4.1.0&q=80&w=400",
    offeredSkills: ["Python", "Django", "PostgreSQL"],
    wantedSkills: ["React", "TypeScript"],
    timestamp: "1d ago",
  },
];

export const mockAcceptedMatches = [
  {
    id: "1",
    name: "Priya Sharma",
    avatar:
      "https://images.unsplash.com/photo-1581065178026-390bc4e78dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHdvbWFuJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MDAzODM3MHww&ixlib=rb-4.1.0&q=80&w=400",
    lastMessage: "Great! When can we start the first session?",
    timestamp: "2h ago",
    unread: 2,
  },
  {
    id: "2",
    name: "Aarav Mehta",
    avatar:
      "https://images.unsplash.com/photo-1649433658557-54cf58577c68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwcm9mZXNzaW9uYWwlMjBtYW58ZW58MXx8fHwxNzcwMDYzOTE3fDA&ixlib=rb-4.1.0&q=80&w=400",
    lastMessage: "Thanks for accepting! Looking forward to learning React.",
    timestamp: "1d ago",
    unread: 0,
  },
];

export const mockMessages: Record<
  string,
  Array<{
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
    status: "sent" | "delivered" | "seen";
  }>
> = {
  "1": [
    {
      id: "1",
      senderId: "1",
      text: "Hi! I saw we matched on Java skills. I'd love to learn from you!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      status: "seen",
    },
    {
      id: "2",
      senderId: "current-user",
      text: "Hey Aarav! Sure, I'd be happy to help. What specifically are you looking to learn?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23),
      status: "seen",
    },
    {
      id: "3",
      senderId: "1",
      text: "I want to improve my Spring Boot skills. I know the basics but need help with microservices.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: "seen",
    },
  ],
  "2": [
    {
      id: "1",
      senderId: "2",
      text: "Hello! I'm interested in learning React from you. Would you be open to a skill swap?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      status: "seen",
    },
    {
      id: "2",
      senderId: "current-user",
      text: "Hi Priya! Absolutely, I'd love to learn Python and ML from you in exchange.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 47),
      status: "seen",
    },
    {
      id: "3",
      senderId: "2",
      text: "Great! When can we start the first session?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: "delivered",
    },
  ],
};
