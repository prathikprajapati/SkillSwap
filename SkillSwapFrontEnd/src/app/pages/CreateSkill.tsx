import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "@/app/contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function CreateSkill() {
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    level: "",
    description: "",
    duration: "",
    location: "",
    availability: "",
    seeking: "",
    format: ""
  });

  const categories = [
    "Technology",
    "Languages",
    "Music",
    "Arts",
    "Business",
    "Fitness",
    "Cooking",
    "Crafts",
    "Photography",
    "Writing"
  ];

  const levels = ["Beginner", "Intermediate", "Advanced"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!firebaseUser) {
        throw new Error("You must be logged in to create a skill listing");
      }

      const idToken = await firebaseUser.getIdToken();

      // Step 1: Create or find the skill
      const skillResponse = await fetch(`${API_BASE_URL}/skills`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.title,
          category: formData.category
        })
      });

      let skillId: string;

      if (!skillResponse.ok) {
        // If skill already exists, get all skills and find it
        const allSkillsResponse = await fetch(`${API_BASE_URL}/skills`, {
          headers: {
            "Authorization": `Bearer ${idToken}`,
            "Content-Type": "application/json"
          }
        });
        
        if (!allSkillsResponse.ok) {
          throw new Error("Failed to fetch existing skills");
        }

        const skills = await allSkillsResponse.json();
        const existingSkill = skills.find((s: any) => s.name.toLowerCase() === formData.title.toLowerCase());
        
        if (!existingSkill) {
          throw new Error("Failed to create or find skill");
        }
        
        skillId = existingSkill.id;
      } else {
        const newSkill = await skillResponse.json();
        skillId = newSkill.id;
      }

      // Step 2: Add skill to user profile (handles both new and existing skills)
      const userSkillResponse = await fetch(`${API_BASE_URL}/users/me/skills`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${idToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          skill_id: skillId,
          skill_type: "offer",
          proficiency_level: formData.level.toLowerCase()
        })
      });

      if (!userSkillResponse.ok) {
        const errData = await userSkillResponse.json();
        // If user already has this skill, just navigate to dashboard (not an error)
        if (userSkillResponse.status === 409) {
          navigate("/dashboard");
          return;
        }
        throw new Error(errData.error || "Failed to add skill to your profile");
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Error creating skill:", err);
      setError(err instanceof Error ? err.message : "Failed to create skill listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 flex-shrink-0" />
          Back to Dashboard
        </Link>

        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent text-3xl md:text-4xl mb-2">Offer a Skill</h1>
            <p className="text-muted-foreground">
              Share your expertise and connect with learners in your community
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-xl text-error animate-[fade-in-up_0.4s_ease-out_forwards]">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="card-hover p-8 bg-elevated border border-border space-y-6 animate-[fade-in-up_0.4s_ease-out_forwards]">
              <h2 className="bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent text-xl font-semibold border-b border-border pb-2">Basic Information</h2>

              <div>
                <label htmlFor="title" className="block mb-2 font-medium bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent">
                  Skill Title <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Web Development with React"
                  required
                  className="input-base w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block mb-2 font-medium bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent">
                    Category <span className="text-error">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="input-base w-full"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="level" className="block mb-2 font-medium bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent">
                    Skill Level <span className="text-error">*</span>
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    required
                    className="input-base w-full"
                  >
                    <option value="">Select a level</option>
                    {levels.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block mb-2 font-medium bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent">
                  Description <span className="text-error">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what you'll teach, what students will learn, and any unique aspects of your teaching style..."
                  required
                  rows={5}
                  className="input-base w-full h-auto py-3 resize-none"
                />
              </div>
            </div>

            {/* Session Details */}
            <div className="card-hover p-8 bg-elevated border border-border space-y-6 animate-[fade-in-up_0.4s_ease-out_forwards]" style={{ animationDelay: '100ms' }}>
              <h2 className="text-xl font-semibold border-b border-border pb-2">Session Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="duration" className="block mb-2 font-medium bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent">
                    Duration per Session <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g., 1-2 hours/week"
                    required
                    className="input-base w-full"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block mb-2 font-medium bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent">
                    Location <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Remote or City, State"
                    required
                    className="input-base w-full"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="format" className="block mb-2 font-medium bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent">
                  Session Format <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  id="format"
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  placeholder="e.g., One-on-one video calls"
                  required
                  className="input-base w-full"
                />
              </div>

              <div>
                <label htmlFor="availability" className="block mb-2 font-medium bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent">
                  Your Availability <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  id="availability"
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  placeholder="e.g., Weekday evenings, Weekend mornings"
                  required
                  className="input-base w-full"
                />
              </div>
            </div>

            {/* What You're Seeking */}
            <div className="card-hover p-8 bg-elevated border border-border space-y-6 animate-[fade-in-up_0.4s_ease-out_forwards]" style={{ animationDelay: '200ms' }}>
              <h2 className="bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent text-xl font-semibold ">What You're Seeking</h2>
              <p className="text-sm text-muted-foreground">
                What skill would you like to learn in exchange for teaching this skill?
              </p>

              <div>
                <label htmlFor="seeking" className="block mb-2 font-medium bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent">
                  Seeking to Learn <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  id="seeking"
                  name="seeking"
                  value={formData.seeking}
                  onChange={handleChange}
                  placeholder="e.g., Spanish Language, Guitar, Photography"
                  required
                  className="input-base w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This helps match you with learners who can teach what you want to learn
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 animate-[fade-in-up_0.4s_ease-out_forwards]" style={{ animationDelay: '300ms' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 flex-shrink-0 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2 flex-shrink-0" />
                    Create Skill Listing
                  </>
                )}
              </button>
              <Link
                to="/dashboard"
                className="btn-ghost py-3"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
