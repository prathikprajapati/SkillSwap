/**
 * Skeleton Component - Design System v2.0
 * 
 * Features:
 * - 60:30:10 color compliance (secondary color for skeleton)
 * - Claymorphism card styling for skeleton containers
 * - Consistent rounded corners
 */

export function Skeleton({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded-[var(--radius-md)] ${className}`}
      style={{
        backgroundColor: 'var(--color-secondary-30)',
        ...style,
      }}
    />
  );
}

export function MatchCardSkeleton() {
  return (
    <div 
      className="h-[340px] w-full p-6 rounded-[var(--radius-xl)] border clay clay-sm flex flex-col"
      style={{
        backgroundColor: 'var(--color-primary-60-elevated)',
        borderColor: 'var(--color-border-subtle)',
      }}
    >
      {/* Header - Avatar & Name */}
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Progress Bar */}
      <Skeleton className="h-2 w-full rounded-full mb-4 shrink-0" />

      {/* Divider */}
      <div className="h-px w-full mb-4 shrink-0 bg-[var(--color-border-default)]" />

      {/* Skills Sections */}
      <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
        {/* Offered Skills */}
        <div className="shrink-0">
          <Skeleton className="h-3 w-14 mb-2" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full shrink-0 bg-[var(--color-border-default)]" />

        {/* Wanted Skills */}
        <div className="shrink-0">
          <Skeleton className="h-3 w-20 mb-2" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="mt-auto pt-4 shrink-0">
        <Skeleton className="h-10 w-full rounded-[var(--radius-md)]" />
      </div>
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div 
      className="p-6 rounded-[var(--radius-xl)] border clay clay-sm"
      style={{
        backgroundColor: 'var(--color-primary-60-elevated)',
        borderColor: 'var(--color-border-subtle)',
      }}
    >
      <Skeleton className="h-6 w-40 mb-6" />
      <div className="space-y-4">
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full rounded-[var(--radius-sm)]" />
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full rounded-[var(--radius-sm)]" />
        </div>
      </div>
    </div>
  );
}
