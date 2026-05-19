import { Button } from "@/app/components/ui/skill-swap-button";
import { SkillChip } from "@/app/components/ui/skill-chip";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useState } from "react";
import SpotlightCard from "./SpotlightCard";
import { Avatar } from "@/components/base/avatar/avatar";

export interface RequestCardProps {
  user: {
    name: string;
    avatar?: string;
    offeredSkills: string[];
    wantedSkills: string[];
    timestamp?: string;
  };
  type: "incoming" | "sent";
  onAccept?: () => void;
  onReject?: () => void;
}

export function RequestCard({ user, type, onAccept, onReject }: RequestCardProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleAccept = () => {
    setIsAccepting(true);
    setTimeout(() => {
      onAccept?.();
    }, 300);
  };

  const handleReject = () => {
    setIsRejecting(true);
    setTimeout(() => {
      onReject?.();
    }, 300);
  };

  // Different spotlight colors based on type
  const spotlightColor = type === "incoming" 
    ? "rgba(34, 197, 94, 0.15)"  // Green tint for incoming
    : "rgba(99, 102, 241, 0.15)"; // Indigo tint for sent

  return (
    <SpotlightCard 
      className={`h-[320px] w-full flex flex-col transition-all duration-300 hover:-translate-y-1 shadow-md ${
        isAccepting ? "animate-out fade-out slide-out-to-right-4" : ""
      } ${isRejecting ? "animate-out fade-out slide-out-to-left-4" : ""}`}
      spotlightColor={spotlightColor as `rgba(${number}, ${number}, ${number}, ${number})`}
    >
      {/* Header - Avatar & Name */}
      <div className="flex items-center gap-3 mb-3 shrink-0 m-2">
        <div className="relative">
          <Avatar
            src={user.avatar}
            alt={user.name}
            size="md"
            initials={user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            status={type === "incoming" ? "online" : undefined}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold truncate leading-tight" style={{ color: '#E0E0E0' }}>
            {user.name}
          </h3>
          {type === "incoming" && (
            <span 
              className="inline-block text-[10px] px-2 py-0.5 rounded font-semibold mt-0.5"
              style={{ 
                backgroundColor: '#FF6B6B20',
                color: '#FF6B6B',
              }}
            >
              New Request
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div 
        className="w-full h-px mb-3 shrink-0"
        style={{ backgroundColor: '#2D2D2D' }}
      />

      {/* Skills Sections - Fixed Height with consistent spacing */}
      <div className="flex-1 min-h-0 flex flex-col gap-5 overflow-hidden m-1 p-1">
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

      {/* Timestamp */}
      {user.timestamp && (
        <div className="flex items-center gap-1.5  shrink-0">
          <Clock className="w-3 h-3" style={{ color: '#757575' }} />
          <span className="text-xs" style={{ color: '#757575' }}>
            {user.timestamp}
          </span>
        </div>
      )}

      {/* Action Area - Fixed at Bottom with consistent spacing */}
      <div className="mt-auto pt-3 shrink-0 mb-2 p-1">
        {type === "incoming" ? (
          <div className="flex gap-2">
            <Button 
              onClick={handleAccept} 
              size="sm" 
              className="flex-[1.2]"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Accept
            </Button>
            <Button 
              onClick={handleReject} 
              variant="outline" 
              size="sm" 
              className="flex-1"
              style={{ fontSize: '14px', fontWeight: 400 }}
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Decline
            </Button>
          </div>
        ) : (
          <div 
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium"
            style={{ 
              backgroundColor: 'var(--secondary)',
              color: '#BDBDBD',
            }}
          >
            <div 
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--warning)' }}
            />
            Pending Response
          </div>
        )}
      </div>
    </SpotlightCard>
  );
}
