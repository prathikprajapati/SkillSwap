import { useState, useCallback, useMemo } from 'react';
import { Calendar, Clock, Globe } from 'lucide-react';
import { useThemeUtils } from '../../contexts/ThemeContext';

interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  showTimezone?: boolean;
}

interface TimeZoneOption {
  value: string;
  label: string;
  offset: string;
}

const COMMON_TIMEZONES: TimeZoneOption[] = [
  { value: 'America/New_York', label: 'Eastern Time', offset: 'EST/EDT' },
  { value: 'America/Chicago', label: 'Central Time', offset: 'CST/CDT' },
  { value: 'America/Denver', label: 'Mountain Time', offset: 'MST/MDT' },
  { value: 'America/Los_Angeles', label: 'Pacific Time', offset: 'PST/PDT' },
  { value: 'Europe/London', label: 'London', offset: 'GMT/BST' },
  { value: 'Europe/Paris', label: 'Paris', offset: 'CET/CEST' },
  { value: 'Asia/Tokyo', label: 'Tokyo', offset: 'JST' },
  { value: 'Australia/Sydney', label: 'Sydney', offset: 'AEDT/AEST' },
];

export const DatePicker = ({
  value,
  onChange,
  placeholder = 'Select date',
  label,
  required = false,
  minDate,
  maxDate,
  className = '',
  showTimezone = false
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York'
  );
  const { getThemeColors } = useThemeUtils();

  // Get user's current timezone
  const userTimezone = useMemo(() => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  }, []);

  // Format date for display
  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  // Format date for input
  const formatDateForInput = useCallback((date: Date) => {
    return date.toISOString().split('T')[0];
  }, []);

  // Handle date selection
  const handleDateSelect = useCallback((date: Date) => {
    onChange(date);
    setIsOpen(false);
  }, [onChange]);

  // Handle manual date input
  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    if (dateStr) {
      const date = new Date(dateStr + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        onChange(date);
      }
    } else {
      onChange(null);
    }
  }, [onChange]);

  // Clear selection
  const handleClear = useCallback(() => {
    onChange(null);
  }, [onChange]);

  // Get timezone offset
  const getTimezoneOffset = useCallback((timezone: string) => {
    try {
      const date = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short'
      });
      const parts = formatter.formatToParts(date);
      const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value;
      return timeZoneName || timezone;
    } catch {
      return timezone;
    }
  }, []);

  const selectedTimezoneOption = useMemo(() => {
    return COMMON_TIMEZONES.find(tz => tz.value === selectedTimezone) || {
      value: selectedTimezone,
      label: selectedTimezone,
      offset: getTimezoneOffset(selectedTimezone)
    };
  }, [selectedTimezone, getTimezoneOffset]);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Date Input */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="date"
              value={value ? formatDateForInput(value) : ''}
              onChange={handleDateChange}
              min={minDate ? formatDateForInput(minDate) : undefined}
              max={maxDate ? formatDateForInput(maxDate) : undefined}
              placeholder={placeholder}
              className={`
                w-full px-3 py-2 pr-10 border border-border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary
                text-text-primary bg-surface
                transition-colors
                ${required ? 'border-l-2 border-l-primary' : ''}
              `}
            />
            
            {/* Calendar icon */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-surface transition-colors"
              aria-label="Open calendar"
            >
              <Calendar className="h-4 w-4 text-text-muted" />
            </button>
          </div>

          {/* Clear button */}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-lg hover:bg-surface transition-colors touch-target"
              aria-label="Clear date"
            >
              <svg className="h-4 w-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Selected date display */}
        {value && (
          <div className="mt-2 p-2 bg-surface border border-border rounded-lg">
            <div className="flex items-center gap-2 text-sm text-text-primary">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">
                {formatDate(value)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Calendar Panel */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-text-primary">Select Date</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-surface transition-colors"
              >
                <svg className="h-4 w-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mini calendar */}
            <div className="grid grid-cols-7 gap-1 text-center mb-4">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div key={day} className="text-xs font-medium text-text-muted py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-sm">
              {Array.from({ length: 35 }, (_, i) => {
                const dayNum = i - 15; // Center around today
                const isCurrentMonth = dayNum > 0 && dayNum <= 31;
                const isToday = value && value.getDate() === dayNum;
                const isSelected = value && value.getDate() === dayNum;
                
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (isCurrentMonth && dayNum > 0) {
                        const newDate = new Date();
                        newDate.setDate(dayNum);
                        handleDateSelect(newDate);
                      }
                    }}
                    disabled={!isCurrentMonth}
                    className={`
                      p-1 rounded transition-colors touch-target
                      ${!isCurrentMonth 
                        ? 'text-text-muted opacity-30 cursor-default' 
                        : isToday 
                          ? 'bg-primary text-white font-bold' 
                          : isSelected
                            ? 'bg-primary/20 text-primary font-bold border border-primary'
                            : 'hover:bg-surface cursor-pointer'
                      }
                    `}
                  >
                    {dayNum > 0 ? dayNum : ''}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Timezone Selector */}
      {showTimezone && (
        <div className="mt-3">
          <label className="flex items-center gap-2 text-sm text-text-primary mb-2">
            <Globe className="h-4 w-4" />
            Timezone
          </label>
          
          <select
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer bg-surface text-text-primary"
          >
            <option value={userTimezone}>
              {userTimezone} (Local) - {getTimezoneOffset(userTimezone)}
            </option>
            <optgroup label="Common Timezones">
              {COMMON_TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>
                  {tz.label} ({tz.offset})
                </option>
              ))}
            </optgroup>
          </select>
          
          {/* Timezone info */}
          {showTimezone && (
            <div className="mt-2 p-2 bg-surface border border-border rounded-lg">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Clock className="h-3 w-3" />
                <span>
                  Current: {selectedTimezoneOption.label} ({selectedTimezoneOption.offset})
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatePicker;
