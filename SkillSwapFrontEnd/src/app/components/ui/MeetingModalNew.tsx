import React, { useState } from 'react';
import { X, Video } from 'lucide-react';
import { useThemeUtils } from '../../../contexts/ThemeContext';
import DatePicker from '../../../components/ui/DatePicker';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (meetingData: MeetingFormData) => void;
}

interface MeetingFormData {
  title: string;
  description: string;
  date: Date | null;
  time: string;
  duration: string;
  participantEmail?: string;
  skillCategory: string;
  sessionType: 'teaching' | 'learning';
}

export const MeetingModal = ({ isOpen, onClose, onSubmit }: MeetingModalProps) => {
  const [formData, setFormData] = useState<MeetingFormData>({
    title: '',
    description: '',
    date: null,
    time: '14:00',
    duration: '60',
    participantEmail: '',
    skillCategory: '',
    sessionType: 'teaching'
  });

  const { getThemeColors } = useThemeUtils();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      title: '',
      description: '',
      date: null,
      time: '14:00',
      duration: '60',
      participantEmail: '',
      skillCategory: '',
      sessionType: 'teaching'
    });
  };

  const handleChange = (field: keyof MeetingFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-text-primary">
            <Video className="h-5 w-5 text-primary" />
            Schedule Meeting
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface transition-colors touch-target"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Meeting Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-2">
              Meeting Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              placeholder="e.g., Spanish Language Exchange"
              className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              placeholder="What will you teach or learn in this session?"
              className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary resize-none transition-colors"
            />
          </div>

          {/* Enhanced Date and Time Picker */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-1">
              <DatePicker
                value={formData.date}
                onChange={(date) => handleChange('date', date)}
                label="Meeting Date *"
                required
                showTimezone={true}
                className="w-full"
              />
            </div>
            
            <div className="lg:col-span-1 space-y-4">
              {/* Time */}
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-text-primary mb-2">
                  Time *
                </label>
                <div className="relative">
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={(e) => handleChange('time', e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-10 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary appearance-none transition-colors"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-4 w-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m0 0l-3-3m3 3v4m0-6-3-3" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-text-primary mb-2">
                  Duration *
                </label>
                <div className="relative">
                  <select
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                    required
                    className="w-full px-4 py-3 pr-10 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary appearance-none cursor-pointer transition-colors"
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-4 w-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m0 0l-3-3m3 3v4m0-6-3-3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Session Type */}
          <div>
            <label htmlFor="sessionType" className="block text-sm font-medium text-text-primary mb-2">
              Session Type *
            </label>
            <div className="relative">
              <select
                id="sessionType"
                name="sessionType"
                value={formData.sessionType}
                onChange={(e) => handleChange('sessionType', e.target.value)}
                required
                className="w-full px-4 py-3 pr-10 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary appearance-none cursor-pointer transition-colors"
              >
                <option value="">Select session type</option>
                <option value="teaching">I'm Teaching</option>
                <option value="learning">I'm Learning</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m0 0l-3-3m3 3v4m0-6-3-3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Enhanced Skill Category */}
          <div>
            <label htmlFor="skillCategory" className="block text-sm font-medium text-text-primary mb-2">
              Skill Category *
            </label>
            <div className="relative">
              <select
                id="skillCategory"
                name="skillCategory"
                value={formData.skillCategory}
                onChange={(e) => handleChange('skillCategory', e.target.value)}
                required
                className="w-full px-4 py-3 pr-10 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary appearance-none cursor-pointer transition-colors"
              >
                <option value="">Select a category</option>
                <option value="Technology">Technology</option>
                <option value="Languages">Languages</option>
                <option value="Music">Music</option>
                <option value="Arts">Arts</option>
                <option value="Business">Business</option>
                <option value="Fitness">Fitness</option>
                <option value="Cooking">Cooking</option>
                <option value="Crafts">Crafts</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m0 0l-3-3m3 3v4m0-6-3-3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Participant Email */}
          <div>
            <label htmlFor="participantEmail" className="block text-sm font-medium text-text-primary mb-2">
              Participant Email (Optional)
            </label>
            <input
              type="email"
              id="participantEmail"
              name="participantEmail"
              value={formData.participantEmail}
              onChange={(e) => handleChange('participantEmail', e.target.value)}
              placeholder="Leave empty to match with anyone"
              className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-border rounded-lg bg-surface text-text-primary hover:bg-surface/80 transition-colors touch-target"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors touch-target font-medium"
              style={{ 
                backgroundColor: getThemeColors().primary,
                color: 'white'
              }}
            >
              Schedule Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingModal;
