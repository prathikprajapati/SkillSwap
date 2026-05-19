import { Button } from "@/app/components/ui/skill-swap-button";
import { SkillChip } from "@/app/components/ui/skill-chip";
import { Sparkles } from "lucide-react";
import SpotlightCard from "./SpotlightCard";
import { Avatar } from "@/components/base/avatar/avatar";

export interface MatchCardProps {
  user: {
    name: string;
    avatar?: string;
    matchScore: number;
    offeredSkills: string[];
    wantedSkills: string[];
  };
  onSendRequest?: () => void;
  isNewMatch?: boolean;
}

export function MatchCard({ user, onSendRequest, isNewMatch }: MatchCardProps) {
  // Calculate progress bar width based on match score
  const progressWidth = `${user.matchScore}%`;

  return (
    <SpotlightCard 
      className="h-[340px] w-full flex flex-col cursor-pointer group transition-transform duration-300 hover:-translate-y-1"
      spotlightColor="rgba(99, 102, 241, 0.15)"
    >
      {/* Header - Avatar & Name with Match Score */}
      <div className="flex items-center gap-3 mb-0.5 shrink-0 p-2">
        <div className="relative">
          <Avatar
            src={user.avatar}
            alt={user.name}
            size="lg"
            initials={user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            className="transition-transform duration-300 group-hover:scale-105"
          />
          {/* New Match Badge */}
          {isNewMatch && (
            <div 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center z-10"
              style={{ backgroundColor: '#FF6B6B' }}
              title="New Match"
            >
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold truncate leading-tight" style={{ color: '#E0E0E0' }}>
            {user.name}
          </h3>
          {/* Match Score - 18px bold as per design spec */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span 
              className="text-lg font-bold"
              style={{ color: 'var(--accent)' }}
            >
              {user.matchScore}% Match
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar - Linear scaling based on match score */}
      <div className="mb-4 shrink-0 m-2 p-2">
        <div 
          className="w-full h-2.5 rounded-full overflow-hidden border"
          style={{ 
            backgroundColor: 'var(--secondary)',
            borderColor: '#2D2D2D',
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              background: `linear-gradient(90deg, var(--accent), var(--accent-indigo))`,
              width: progressWidth,
            }}
          />
        </div>
      </div>

      {/* Divider */}
      <div 
        className="w-full h-px mb-3 shrink-0"
        style={{ backgroundColor: '#2D2D2D' }}
      />

      {/* Skills Sections - Fixed Height with consistent spacing */}
      <div className="m-2 p-1flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
        {/* Offered Skills */}
        <div className="shrink-0">
          <p 
            className="text-[10px] font-semibold uppercase tracking-wider mb-2"
            style={{ color: '#BDBDBD' }}
          >
            Can Teach
          </p>
          <div className="flex flex-wrap gap-1.5">
            {user.offeredSkills.slice(0, 3).map((skill) => (
              <SkillChip key={skill} skill={skill} type="offer" size="sm" />
            ))}
            {user.offeredSkills.length > 3 && (
              <span 
                className="text-[10px] px-2 py-1 rounded-full font-medium"
                style={{ 
                  backgroundColor: 'var(--secondary)',
                  color: 'var(--text-secondary)',
                }}
              >
                +{user.offeredSkills.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Divider between sections */}
        <div 
          className="w-full h-px shrink-0"
          style={{ backgroundColor: '#2D2D2D', opacity: 0.5 }}
        />

        {/* Wanted Skills */}
        <div className="shrink-0">
          <p 
            className="text-[10px] font-semibold uppercase tracking-wider mb-2"
            style={{ color: '#BDBDBD' }}
          >
            Wants to Learn
          </p>
          <div className="flex flex-wrap gap-1.5">
            {user.wantedSkills.slice(0, 3).map((skill) => (
              <SkillChip key={skill} skill={skill} type="want" size="sm" />
            ))}
            {user.wantedSkills.length > 3 && (
              <span 
                className="text-[10px] px-2 py-1 rounded-full font-medium"
                style={{ 
                  backgroundColor: 'var(--secondary)',
                  color: 'var(--text-secondary)',
                }}
              >
                +{user.wantedSkills.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button - Fixed at Bottom with consistent spacing */}
      <div className="mt-auto pt-4 shrink-0 mb-2  p-3">
        <Button onClick={onSendRequest} size="sm" className="w-full">
          Send Request
        </Button>
      </div>
    </SpotlightCard>
  );
}
