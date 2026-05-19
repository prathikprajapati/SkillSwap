import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Users, Video } from "lucide-react";
import { useThemeUtils } from '../../contexts/ThemeContext';
import type { UserProfile } from '../../api/users';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import firebaseApp from '../../config/firebase';
import { toast } from 'sonner';
import { Timestamp } from 'firebase/firestore';
import DatePicker from '../../../components/ui/DatePicker';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (meetingData: MeetingFormData) => void;
}

interface MeetingFormData {
  title: string;
  description: string;
  date: string;
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
    date: '',
    time: '',
    duration: '60',
    participantEmail: '',
    skillCategory: '',
    sessionType: 'teaching'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '60',
      participantEmail: '',
      skillCategory: '',
      sessionType: 'teaching'
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Schedule Meeting
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Meeting Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Meeting Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Spanish Language Exchange"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="What will you teach or learn in this session?"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Session Type */}
          <div>
            <label htmlFor="sessionType" className="block text-sm font-medium mb-2">
              Session Type *
            </label>
            <div className="relative">
              <select
                id="sessionType"
                name="sessionType"
                value={formData.sessionType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="">Select session type</option>
                <option value="teaching">I'm Teaching</option>
                <option value="learning">I'm Learning</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9 6 6m0-6-6-6"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Skill Category */}
          <div>
            <label htmlFor="skillCategory" className="block text-sm font-medium mb-2">
              Skill Category *
            </label>
            <div className="relative">
              <select
                id="skillCategory"
                name="skillCategory"
                value={formData.skillCategory}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
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
                <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9 6 6m0-6-6-6"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium mb-2">
                Time *
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium mb-2">
              Duration *
            </label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          {/* Participant Email (Optional) */}
          <div>
            <label htmlFor="participantEmail" className="block text-sm font-medium mb-2">
              Participant Email (Optional)
            </label>
            <input
              type="email"
              id="participantEmail"
              name="participantEmail"
              value={formData.participantEmail}
              onChange={handleChange}
              placeholder="Leave empty to match with anyone"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
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
