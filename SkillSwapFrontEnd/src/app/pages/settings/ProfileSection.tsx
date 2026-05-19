import { useState } from "react";
import { Save, Upload, CheckCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  avatar: string;
}

export function ProfileSection() {
  const { user, updateProfile } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || getInitials(user?.name || ""));
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: user?.name?.split(' ')[0] || "",
    lastName: user?.name?.split(' ')[1] || "",
    email: user?.email || "",
    bio: user?.bio || "",
    avatar: user?.avatar || getInitials(user?.name || "")
  });

  function getInitials(name: string): string {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    setProfileData(prev => ({
      ...prev,
      avatar
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update profile data
      const updatedProfile = {
        ...profileData,
        name: `${profileData.firstName} ${profileData.lastName}`,
        avatar: selectedAvatar
      };

      // Here you would call your actual updateProfile API
      console.log('Saving profile:', updatedProfile);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setProfileData({
      firstName: user?.name?.split(' ')[0] || "",
      lastName: user?.name?.split(' ')[1] || "",
      email: user?.email || "",
      bio: user?.bio || "",
      avatar: user?.avatar || getInitials(user?.name || "")
    });
    setSelectedAvatar(user?.avatar || getInitials(user?.name || ""));
  };

  const preBuiltAvatars = [
    { type: "initials", value: "AJ", color: "bg-primary/10", textColor: "text-primary" },
    { type: "initials", value: "AL", color: "bg-blue-500/10", textColor: "text-blue-500" },
    { type: "initials", value: "MJ", color: "bg-purple-500/10", textColor: "text-purple-500" },
    { type: "emoji", value: "🎨", color: "bg-yellow-500/10", textColor: "" },
    { type: "emoji", value: "🎵", color: "bg-pink-500/10", textColor: "" },
    { type: "emoji", value: "💻", color: "bg-green-500/10", textColor: "" },
    { type: "emoji", value: "📚", color: "bg-orange-500/10", textColor: "" },
    { type: "emoji", value: "🎯", color: "bg-red-500/10", textColor: "" },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
      
      {/* Success Message */}
      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-700 dark:text-green-300">Profile updated successfully!</span>
        </div>
      )}
      
      <div className="flex flex-col gap-6 pb-6 border-b border-border">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
            {selectedAvatar}
          </div>
          <div>
            <label className="btn-secondary py-2 px-4 mb-2 text-sm inline-flex items-center gap-2 cursor-pointer">
              <Upload className="h-4 w-4 flex-shrink-0" />
              Upload Image
              <input type="file" className="hidden" accept="image/*" />
            </label>
            <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 800K</p>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-3">Or choose a pre-built avatar:</p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {preBuiltAvatars.map((avatar, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleAvatarSelect(avatar.value)}
                className={`h-12 w-12 rounded-full ${avatar.color} flex items-center justify-center text-lg hover:ring-2 hover:ring-primary transition-all ${
                  selectedAvatar === avatar.value ? "ring-2 ring-primary ring-offset-2" : ""
                }`}
              >
                <span className={avatar.textColor}>{avatar.value}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="firstName">First Name</label>
          <input 
            id="firstName" 
            name="firstName"
            type="text" 
            value={profileData.firstName}
            onChange={handleInputChange}
            className="input-base w-full" 
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="lastName">Last Name</label>
          <input 
            id="lastName" 
            name="lastName"
            type="text" 
            value={profileData.lastName}
            onChange={handleInputChange}
            className="input-base w-full" 
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="email">Email Address</label>
        <input 
          id="email" 
          name="email"
          type="email" 
          value={profileData.email}
          onChange={handleInputChange}
          className="input-base w-full" 
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1.5" htmlFor="bio">Bio</label>
        <textarea 
          id="bio" 
          name="bio"
          rows={4} 
          className="input-base w-full h-auto py-3 resize-none" 
          value={profileData.bio}
          onChange={handleInputChange}
          placeholder="Tell us about yourself and what skills you'd like to share or learn..."
        />
      </div>
      
      <div className="pt-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-border mt-8">
        <button 
          type="button"
          onClick={handleCancel}
          className="btn-ghost py-2 px-4 w-full sm:w-auto"
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={isSaving}
          className="btn-primary py-2 px-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 flex-shrink-0" /> 
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
