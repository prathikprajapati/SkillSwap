import { Link } from "react-router";
import { ArrowRight, Users, BookOpen, Award, Clock, Star, TrendingUp } from "lucide-react";

export function LandingPage() {
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
      name: "Sarah Chen",
      skill: "Learned Piano",
      avatar: "SC",
      quote: "I traded my web design skills for piano lessons. Best decision ever!",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      skill: "Learned Spanish",
      avatar: "MJ",
      quote: "Found an amazing language partner. We meet twice a week and both are improving rapidly.",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      skill: "Learned Photography",
      avatar: "ER",
      quote: "Swapped my cooking skills for photography lessons. The community here is incredible.",
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
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Join 10,000+ skill swappers</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 animate-[fade-in-up_0.4s_ease-out_forwards] text-foreground" style={{ animationDelay: '100ms' }}>
              Trade Skills,
              <br />
              <span className="text-foreground">Not Money</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-[fade-in-up_0.4s_ease-out_forwards]" style={{ animationDelay: '200ms' }}>
              Connect with people who want to learn what you know and teach you what they know. No payments, just pure skill exchange.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-[fade-in-up_0.4s_ease-out_forwards]" style={{ animationDelay: '300ms' }}>
              <Link
                to="/browse"
                className="btn-primary py-4 px-8 text-lg"
              >
                Browse Skills
                <ArrowRight className="h-5 w-5 ml-2" />
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
            <h2 className="text-3xl md:text-4xl mb-4">How SkillSwap Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A simple, community-driven platform for exchanging knowledge and skills
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center p-8 card-hover animate-[fade-in-up_0.4s_ease-out_forwards]"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-primary" />
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
            <h2 className="text-3xl md:text-4xl mb-4">Popular Skills</h2>
            <p className="text-muted-foreground">Most sought-after skills in the community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {popularSkills.map((skill, index) => (
              <Link
                key={index}
                to={`/browse?category=${skill.category}`}
                className="flex items-center justify-between p-6 card-hover animate-[fade-in-up_0.4s_ease-out_forwards]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div>
                  <h4 className="text-lg mb-1">{skill.name}</h4>
                  <p className="text-sm text-muted-foreground">{skill.category}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground bg-elevated px-3 py-1 rounded-full border border-border">
                  <Users className="h-4 w-4" />
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
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-[fade-in-up_0.4s_ease-out_forwards]">
            <h2 className="text-3xl md:text-4xl mb-4">Success Stories</h2>
            <p className="text-muted-foreground">See what our community members are saying</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="p-8 card-hover flex flex-col justify-between h-full animate-[fade-in-up_0.4s_ease-out_forwards]"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div>
                  <div className="flex items-center gap-1 mb-6">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="mb-8 text-muted-foreground italic text-lg leading-relaxed">"{testimonial.quote}"</p>
                </div>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-primary">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-primary">{testimonial.skill}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

