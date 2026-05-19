import { X } from "lucide-react";

export interface SkillChipProps {
  skill: string;
  type: "offer" | "want";
  onRemove?: () => void;
  size?: "default" | "sm";
}

// Utility function for consistent truncation
function truncateSkill(skill: string, maxLength: number = 12): string {
  if (skill.length <= maxLength) return skill;
  return skill.slice(0, maxLength - 1) + '…';
}

export function SkillChip({ skill, type, onRemove, size = "default" }: SkillChipProps) {
  const bgColor = type === "offer" ? "var(--accent-light)" : "var(--primary-light)";
  const textColor = type === "offer" ? "var(--accent)" : "var(--primary-dark)";
  
  const padding = size === "sm" ? "px-2 py-1" : "px-3 py-2";
  const fontSize = size === "sm" ? "text-[10px]" : "text-sm";
  
  // Consistent truncation for all skills
  const displaySkill = size === "sm" ? truncateSkill(skill, 10) : truncateSkill(skill, 15);

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full ${padding} ${fontSize} font-medium transition-all duration-200 hover:shadow-sm whitespace-nowrap`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
      title={skill} // Show full skill name on hover
    >
      <span>{displaySkill}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:opacity-70 transition-opacity rounded-full hover:bg-white/50 p-0.5 flex-shrink-0"
          aria-label={`Remove ${skill}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
