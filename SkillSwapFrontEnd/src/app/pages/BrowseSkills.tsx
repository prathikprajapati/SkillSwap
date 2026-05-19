import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Link } from "react-router";
import { Search, Filter, Star, Clock, MapPin, X, Loader2 } from "lucide-react";
import { useAuth } from "@/app/contexts/AuthContext";
import { EmptyState } from "@/app/components/ui/EmptyState";

interface SkillListing {
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
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

function BrowseSkills() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [userSkills, setUserSkills] = useState<SkillListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { firebaseUser } = useAuth();

  const categories = [
    "All",
    "Technology",
    "Languages", 
    "Music",
    "Arts",
    "Business",
    "Fitness",
    "Cooking",
    "Crafts"
  ];

  const levels = ["Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    fetchUserSkills();
  }, []);

  const fetchUserSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!firebaseUser) {
        setLoading(false);
        return;
      }

      // Get Firebase token
      const idToken = await firebaseUser.getIdToken();
      
      // Fetch all user skill offerings
      const response = await fetch(`${API_BASE_URL}/skills/offerings`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch skills');
      }
      
      const data = await response.json();
      setUserSkills(data);
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError(err instanceof Error ? err.message : 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return userSkills.filter(skill => {
      const matchesSearch = skill.skill?.name?.toLowerCase().includes(searchLower) || 
                           skill.skill?.category?.toLowerCase().includes(searchLower);
      const matchesCategory = !selectedCategory || selectedCategory === "All" || skill.skill?.category === selectedCategory;
      const matchesLevel = !selectedLevel || skill.proficiency_level === selectedLevel.toLowerCase();
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [userSkills, searchQuery, selectedCategory, selectedLevel]);

  const clearFilters = useCallback(() => {
    setSelectedCategory(null);
    setSelectedLevel(null);
    setSearchQuery("");
  }, []);

  const hasActiveFilters = selectedCategory || selectedLevel || searchQuery;

  // Get initials from name - memoized
  const getInitials = useCallback((name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-[1280px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-[fade-in-up_0.4s_ease-out_forwards]">
          <h1 className="bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent text-3xl md:text-4xl mb-2">Browse Skills</h1>
          <p className="text-muted-foreground">Discover skills to learn and people to connect with</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-6 animate-[fade-in-up_0.4s_ease-out_forwards]" style={{ animationDelay: '100ms' }}>
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base w-full pl-12 h-14 text-lg shadow-sm"
            />
          </div>

          {/* Divider between search and filters - HIGH VISIBILITY */}
          <div className="divider-gradient" style={{ height: '3px', opacity: 0.8 }} />

          <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between bg-surface p-4 rounded-xl border border-border">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category === "All" ? null : category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    (category === "All" && !selectedCategory) || selectedCategory === category
                      ? "bg-primary text-white shadow-md scale-105"
                      : "bg-background text-foreground border border-border hover:border-primary/50 hover:text-primary"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Vertical divider between category and level filters (desktop) */}
            <div className="hidden lg:block divider-vertical h-8" />
            
            {/* Horizontal divider for mobile */}
            <div className="lg:hidden divider-compact" />

            {/* Level Filters & Clear */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-muted-foreground mr-2">
                <Filter className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium">Level:</span>
              </div>
              <div className="flex bg-background border border-border rounded-lg overflow-hidden">
                {levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
                    className={`px-3 py-1.5 text-sm transition-colors border-r last:border-0 border-border ${
                      selectedLevel === level
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-error hover:bg-error/10 rounded-lg transition-colors ml-2"
                >
                  <X className="h-4 w-4 flex-shrink-0" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Divider before results */}
        <div className="divider-compact" />

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center animate-[fade-in-up_0.4s_ease-out_forwards]" style={{ animationDelay: '200ms' }}>
          <p className="text-muted-foreground font-medium">
            {loading ? 'Loading...' : `Showing ${filteredSkills.length} ${filteredSkills.length === 1 ? 'skill' : 'skills'}`}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12 bg-elevated border border-error/30 rounded-xl">
            <p className="text-error mb-4">{error}</p>
            <button onClick={fetchUserSkills} className="btn-primary py-2 px-4">
              Retry
            </button>
          </div>
        )}

        {/* Skills Grid */}
        {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSkills.map((skill, index) => (
            <Link
              key={skill.id}
              to={`/skill/${skill.skill_id}`}
              className="card-hover flex flex-col p-6 h-full animate-[fade-in-up_0.4s_ease-out_forwards] border border-border/70 rounded-xl bg-elevated"
              style={{ animationDelay: `${index * 100 + 300}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-secondary">
                      {getInitials(skill.user?.name || 'User')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{skill.user?.name || 'Unknown User'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-warning text-warning flex-shrink-0" />
                      <span className="text-sm font-medium">New</span>
                      <span className="text-xs text-muted-foreground">(0 reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title and Description */}
              <h3 className="text-xl mb-2 group-hover:text-primary transition-colors">{skill.skill?.name || 'Untitled Skill'}</h3>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                {skill.skill?.category ? `${skill.skill.category} - ${skill.proficiency_level}` : skill.proficiency_level}
              </p>

              <div className="mt-auto">
                {/* Meta Info */}
                <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>Flexible schedule</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>Remote</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 text-xs rounded-md bg-primary/10 text-primary font-medium border border-primary/20">
                    {skill.skill?.category || 'General'}
                  </span>
                  <span className="px-2.5 py-1 text-xs rounded-md bg-surface text-foreground font-medium border border-border capitalize">
                    {skill.proficiency_level}
                  </span>
                </div>

                {/* Seeking */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Seeking: <span className="text-primary font-medium">Exchange skills</span>
                  </p>
                  <span className="text-xs font-medium text-secondary hover:underline flex items-center gap-1">
                    View Details
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        )}

        {/* Divider before empty state */}
        {!loading && !error && filteredSkills.length === 0 && (
          <div className="divider" />
        )}

        {/* Empty State */}
        {!loading && !error && filteredSkills.length === 0 && (
          <EmptyState
            type="search"
            title="No skills found"
            description="We couldn't find any skills matching your current filters. Try adjusting your search or clearing filters."
            action={{
              label: "Clear All Filters",
              onClick: clearFilters,
              variant: "default",
            }}
            className="mt-6 animate-[fade-in-up_0.4s_ease-out_forwards]"
          />
        )}
      </div>
    </div>
  );
}

export default memo(BrowseSkills);
