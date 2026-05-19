import { Link } from "react-router";
import { ArrowRight, Users, BookOpen, Award, Clock, Star, TrendingUp } from "lucide-react";
import ScrollCarousel from "@/app/components/ui/ScrollCarousel";

export default function Home() {
  const features = [
    {
      icon: Users,
      title: "Connect with Learners",
      description: "Find people who want to learn what you know and teach you what they know."
    },
    {
      icon: BookOpen,
      title: "Learn Anything",
      description: "From cooking to coding, photography to piano - swap skills without spending money."
    },
    {
      icon: Award,
      title: "Build Your Portfolio",
      description: "Earn badges and reviews as you share your expertise with the community."
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Set your own availability and connect with learners on your schedule."
    }
  ];

  const popularSkills = [
    { name: "Web Development", count: 234, category: "Technology" },
    { name: "Spanish Language", count: 189, category: "Languages" },
    { name: "Guitar", count: 156, category: "Music" },
    { name: "Digital Marketing", count: 142, category: "Business" },
    { name: "Photography", count: 128, category: "Arts" },
    { name: "Yoga", count: 98, category: "Fitness" }
  ];

  const testimonials = [
    {
      icon: Star,
      title: "Sarah Chen",
      description: "I traded my web design skills for piano lessons. Best decision ever!",
      name: "Sarah Chen",
      skill: "Learned Piano",
      avatar: "SC",
      quote: "I traded my web design skills for piano lessons. Best decision ever!",
      rating: 5
    },
    {
      icon: Star,
      title: "Marcus Johnson",
      description: "Found an amazing language partner. We meet twice a week and both are improving rapidly.",
      name: "Marcus Johnson",
      skill: "Learned Spanish",
      avatar: "MJ",
      quote: "Found an amazing language partner. We meet twice a week and both are improving rapidly.",
      rating: 5
    },
    {
      icon: Star,
      title: "Emma Rodriguez",
      description: "Swapped my cooking skills for photography lessons. The community here is incredible.",
      name: "Emma Rodriguez",
      skill: "Learned Photography",
      avatar: "ER",
      quote: "Swapped my cooking skills for photography lessons. The community here is incredible.",
      rating: 5
    },
    {
      icon: Star,
      title: "Alex Kumar",
      description: "As a software developer, I always wanted to learn guitar. Found an amazing musician who wanted to learn coding!",
      name: "Alex Kumar",
      skill: "Learned Guitar",
      avatar: "AK",
      quote: "As a software developer, I always wanted to learn guitar. Found an amazing musician who wanted to learn coding!",
      rating: 5
    },
    {
      icon: Star,
      title: "Lisa Wang",
      description: "Teaching math in exchange for cooking lessons has been life-changing. My family loves the new recipes!",
      name: "Lisa Wang",
      skill: "Learned Cooking",
      avatar: "LW",
      quote: "Teaching math in exchange for cooking lessons has been life-changing. My family loves the new recipes!",
      rating: 5
    },
    {
      icon: Star,
      title: "James Miller",
      description: "Swapped my marketing expertise for yoga instruction. Both my business and health have improved tremendously.",
      name: "James Miller",
      skill: "Learned Yoga",
      avatar: "JM",
      quote: "Swapped my marketing expertise for yoga instruction. Both my business and health have improved tremendously.",
      rating: 5
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-[fade-in-up_0.4s_ease-out_forwards]">
              <TrendingUp className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">Join 10,000+ skill swappers</span>
            </div>
            <h1 className="bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent text-5xl md:text-6xl lg:text-7xl mb-6 animate-[fade-in-up_0.4s_ease-out_forwards]" style={{ animationDelay: '100ms' }}>
              Trade Skills,
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent">
                Not Money
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-[fade-in-up_0.4s_ease-out_forwards]" style={{ animationDelay: '200ms' }}>
              Connect with people who want to learn what you know and teach you what they know. No payments, just pure skill exchange.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-[fade-in-up_0.4s_ease-out_forwards]" style={{ animationDelay: '300ms' }}>
              <Link
                to="/browse"
                className="inline-flex items-center justify-center gap-2 btn-primary py-4 px-8 text-lg"
              >
                Browse Skills
                <ArrowRight className="h-5 w-5 flex-shrink-0" />
              </Link>
              <Link
                to="/create"
                className="btn-secondary py-4 px-8 text-lg"
              >
                Offer Your Skills
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-[fade-in-up_0.4s_ease-out_forwards]">
            <h2 className="bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent text-3xl md:text-4xl mb-4">How SkillSwap Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A simple, community-driven platform for exchanging knowledge and skills
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center p-8 card-hover animate-[fade-in-up_0.4s_ease-out_forwards] border border-border rounded-xl bg-card"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-primary flex-shrink-0" />
                </div>
                <h3 className="mb-3 text-xl">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Skills */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-[fade-in-up_0.4s_ease-out_forwards]">
            <h2 className="bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent text-3xl md:text-4xl mb-4">Popular Skills</h2>
            <p className="text-muted-foreground">Most sought-after skills in the community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {popularSkills.map((skill, index) => (
              <Link
                key={index}
                to={`/browse?category=${skill.category}`}
                className="flex items-center justify-between p-6 card-hover animate-[fade-in-up_0.4s_ease-out_forwards] border border-border rounded-xl bg-card"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div>
                  <h4 className="text-lg mb-1">{skill.name}</h4>
                  <p className="text-sm text-muted-foreground">{skill.category}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground bg-elevated px-3 py-1 rounded-full border border-border">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  <span>{skill.count}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              View all skills
              <ArrowRight className="h-4 w-4 flex-shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-[fade-in-up_0.4s_ease-out_forwards]">
            <h2 className="bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent text-3xl md:text-4xl mb-4">Success Stories</h2>
            <p className="text-muted-foreground">See what our community members are saying</p>
          </div>
          <ScrollCarousel features={testimonials} className="min-h-[400px]" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-primary text-white text-center rounded-t-3xl mt-8">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl mb-6 font-bold text-white">Ready to Start Swapping?</h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto text-white">
            Join thousands of learners and teachers exchanging skills every day
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-lg hover:bg-surface hover:-translate-y-1 transition-all shadow-lg active:scale-95"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5 flex-shrink-0" />
          </Link>
        </div>
      </section>
    </div>
  );
}
