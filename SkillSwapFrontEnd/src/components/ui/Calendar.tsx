import { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useThemeUtils } from '../../contexts/ThemeContext';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  className?: string;
  ariaLabel?: string;
}

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasEvents: boolean;
}

export const Calendar = ({ 
  selectedDate, 
  onDateSelect, 
  className = '',
  ariaLabel = 'Calendar'
}: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { getThemeColors } = useThemeUtils();

  // Generate calendar days for current month
  const generateCalendarDays = useCallback((): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: CalendarDay[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: 0,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        hasEvents: false
      });
    }
    
    // Add all days of current month
    const today = new Date();
    const isCurrentMonthToday = today.getMonth() === month && today.getFullYear() === year;
    const todayDate = today.getDate();
    const selectedDateStr = selectedDate?.toDateString();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const currentDateStr = currentDate.toDateString();
      
      days.push({
        date: i,
        isCurrentMonth: true,
        isToday: isCurrentMonthToday && i === todayDate,
        isSelected: selectedDateStr === currentDateStr,
        hasEvents: Math.random() > 0.8 // Mock events for some days
      });
    }
    
    return days;
  }, [currentMonth, selectedDate]);

  const calendarDays = useMemo(() => generateCalendarDays(), [generateCalendarDays]);

  // Navigation functions
  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date());
    onDateSelect?.(new Date());
  }, [onDateSelect]);

  const handleDateClick = useCallback((day: CalendarDay) => {
    if (day.isCurrentMonth && day.date > 0) {
      const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day.date);
      onDateSelect?.(selectedDate);
    }
  }, [currentMonth, onDateSelect]);

  const monthYear = useMemo(() => {
    return currentMonth.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  }, [currentMonth]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div 
      className={`bg-card border border-border rounded-xl p-4 ${className}`}
      role="grid"
      aria-label={ariaLabel}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          {monthYear}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg hover:bg-surface transition-colors touch-target"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm rounded-lg hover:bg-surface transition-colors touch-target"
            aria-label="Go to today"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg hover:bg-surface transition-colors touch-target"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div 
            key={day} 
            className="text-center text-xs font-medium text-text-muted py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day)}
            disabled={!day.isCurrentMonth || day.date === 0}
            className={`
              relative p-2 rounded-lg text-sm transition-all duration-200 touch-target
              ${!day.isCurrentMonth || day.date === 0 
                ? 'text-text-muted cursor-default opacity-30' 
                : day.isToday 
                  ? 'bg-primary text-white font-bold shadow-lg' 
                  : day.isSelected
                    ? 'bg-primary/20 text-primary font-bold border-2 border-primary'
                    : day.hasEvents
                      ? 'bg-accent/10 text-accent font-medium hover:bg-accent/20'
                      : 'hover:bg-surface hover:text-text-primary cursor-pointer'
              }
            `}
            aria-label={`Day ${day.date}${day.isToday ? ' (Today)' : ''}`}
            aria-disabled={!day.isCurrentMonth || day.date === 0}
            aria-pressed={day.isSelected}
          >
            {day.date > 0 && (
              <>
                <span className={day.isToday ? 'text-white' : ''}>
                  {day.date}
                </span>
                
                {/* Event indicator */}
                {day.hasEvents && (
                  <div 
                    className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: getThemeColors().accent }}
                  />
                )}
              </>
            )}
          </button>
        ))}
      </div>

      {/* Today indicator */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">
            {selectedDate ? `Selected: ${selectedDate.toLocaleDateString()}` : 'No date selected'}
          </span>
          {selectedDate && (
            <button
              onClick={goToToday}
              className="text-primary hover:text-primary/80 transition-colors"
              aria-label="Clear selection"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
