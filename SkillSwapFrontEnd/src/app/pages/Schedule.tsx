import { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, Video, PlusCircle, RefreshCw } from "lucide-react";
import { sessionsApi, type Session } from "../api/sessions";
import MeetingModal from "../components/ui/MeetingModalNew";

export default function Schedule() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const loadSessions = useCallback(async () => {
    try {
      const data = await sessionsApi.getMySessions();
      setSessions(data);
    } catch (error) {
      console.warn("API call failed, using mock data:", error);
      // Provide mock data for testing
      const mockSessions: Session[] = [
        {
          id: "session-1",
          teacher_id: "current-user",
          learner_id: "user-2",
          skill_id: "spanish",
          status: "scheduled",
          scheduled_at: "2026-10-24T14:00:00Z",
          created_at: "2026-10-20T10:00:00Z",
          teacher: {
            id: "current-user",
            name: "Current User",
            avatar: "CU"
          },
          learner: {
            id: "user-2",
            name: "Maria Garcia",
            avatar: "MG"
          },
          skill: {
            id: "spanish",
            name: "Spanish Language",
            category: "Languages"
          }
        },
        {
          id: "session-2",
          teacher_id: "user-3",
          learner_id: "current-user",
          skill_id: "guitar",
          status: "scheduled",
          scheduled_at: "2026-10-26T16:00:00Z",
          created_at: "2026-10-19T09:00:00Z",
          teacher: {
            id: "user-3",
            name: "John Smith",
            avatar: "JS"
          },
          learner: {
            id: "current-user",
            name: "Current User",
            avatar: "CU"
          },
          skill: {
            id: "guitar",
            name: "Guitar Lessons",
            category: "Music"
          }
        }
      ];
      setSessions(mockSessions);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refreshSessions = useCallback(() => {
    setIsRefreshing(true);
    // Add a small delay to prevent rapid refresh calls
    setTimeout(() => {
      loadSessions();
    }, 300);
  }, [loadSessions]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Listen for custom event when new session is created
  useEffect(() => {
    let refreshTimeout: NodeJS.Timeout;
    
    const handleNewSession = (event: CustomEvent) => {
      console.log('Schedule page received session:created event:', event.detail);
      
      // Clear any pending refresh
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      
      // If we have session data, add it immediately to state for instant UI update
      if (event.detail) {
        setSessions(prev => [...prev, event.detail]);
      }
      
      // Debounce the refresh to prevent rapid calls
      refreshTimeout = setTimeout(() => {
        refreshSessions();
      }, 500);
    };

    const handleNewSessionLegacy = () => {
      // Clear any pending refresh
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      
      console.log('Schedule page received session:created event (legacy)');
      refreshTimeout = setTimeout(() => {
        refreshSessions();
      }, 500);
    };

    window.addEventListener('session:created', handleNewSession as EventListener);
    window.addEventListener('session:updated', handleNewSessionLegacy);
    
    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      window.removeEventListener('session:created', handleNewSession as EventListener);
      window.removeEventListener('session:updated', handleNewSessionLegacy);
    };
  }, [refreshSessions]);

  // Generate calendar days for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: Array<{
      date: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      hasSession: boolean;
    }> = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: 0,
        isCurrentMonth: false,
        isToday: false,
        hasSession: false
      });
    }
    
    // Add all days of the current month
    const today = new Date();
    const isCurrentMonthToday = today.getMonth() === month && today.getFullYear() === year;
    const todayDate = today.getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const hasSession = sessions.some(session => {
        if (!session.scheduled_at) return false;
        const sessionDate = new Date(session.scheduled_at);
        return sessionDate.getDate() === i && 
               sessionDate.getMonth() === month && 
               sessionDate.getFullYear() === year;
      });
      
      days.push({
        date: i,
        isCurrentMonth: true,
        isToday: isCurrentMonthToday && i === todayDate,
        hasSession
      });
    }
    
    return days;
  };

  // Navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleMeetingSubmit = async (meetingData: any) => {
    try {
      // Create a mock session for testing since API might not be fully implemented
      const mockSession = {
        id: `session-${Date.now()}`,
        teacher_id: "current-user",
        learner_id: meetingData.participantEmail || "pending-user",
        skill_id: meetingData.skillCategory,
        status: "scheduled" as const,
        scheduled_at: `${meetingData.date}T${meetingData.time}:00Z`,
        created_at: new Date().toISOString(),
        teacher: {
          id: "current-user",
          name: "Current User",
          avatar: "CU"
        },
        learner: meetingData.participantEmail ? {
          id: "learner-user",
          name: meetingData.participantEmail,
          avatar: "LU"
        } : undefined,
        skill: {
          id: meetingData.skillCategory,
          name: meetingData.skillCategory,
          category: meetingData.skillCategory
        }
      };

      // Try to create via API, but fall back to mock if it fails
      let newSession;
      try {
        newSession = await sessionsApi.createSession(mockSession);
      } catch (apiError) {
        console.warn('API call failed, using mock data:', apiError);
        newSession = mockSession;
        
        // Add to local state for immediate UI update
        setSessions(prev => [...prev, mockSession]);
      }

      // Refresh the sessions list
      refreshSessions();
      
      // Emit custom event for other components
      window.dispatchEvent(new CustomEvent('session:created', { detail: newSession }));
      
      console.log('Session created:', newSession);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent text-3xl font-bold mb-2">Schedule</h1>
            <p className="text-muted-foreground">Manage your upcoming skill swap sessions</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={refreshSessions}
              disabled={isRefreshing}
              className="btn-ghost py-2 px-4 whitespace-nowrap disabled:opacity-50"
            >
              <RefreshCw className={`mr-2 h-4 w-4 flex-shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} /> 
              Refresh
            </button>
            <button 
              onClick={() => {
                console.log('Test button clicked - emitting test event');
                const testSession = {
                  id: `test-${Date.now()}`,
                  teacher_id: "current-user",
                  learner_id: "test-user",
                  skill_id: "test",
                  status: "scheduled" as const,
                  scheduled_at: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                  teacher: { id: "current-user", name: "Test User", avatar: "TU" },
                  learner: { id: "test-user", name: "Test Learner", avatar: "TL" },
                  skill: { id: "test", name: "Test Skill", category: "Test" }
                };
                window.dispatchEvent(new CustomEvent('session:created', { detail: testSession }));
              }}
              className="btn-secondary py-2 px-4 whitespace-nowrap"
            >
              Test Event
            </button>
            <button 
              onClick={() => setShowMeetingModal(true)}
              className="btn-primary py-2 px-4 whitespace-nowrap"
            >
              <PlusCircle className="mr-2 h-4 w-4 flex-shrink-0" /> Book New Session
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Widget */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card-hover p-6 bg-surface border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-1 rounded hover:bg-accent transition-colors"
                    aria-label="Previous month"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <button
                    onClick={goToToday}
                    className="px-2 py-1 text-xs rounded hover:bg-accent transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-1 rounded hover:bg-accent transition-colors"
                    aria-label="Next month"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <span key={day} className="text-xs font-medium text-muted-foreground py-1">{day}</span>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {getCalendarDays().map((day, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded-md transition-colors ${
                      !day.isCurrentMonth 
                        ? 'text-muted-foreground/30 cursor-default'
                        : day.isToday 
                          ? 'bg-primary text-white font-bold' 
                          : day.hasSession 
                            ? 'bg-primary/20 text-primary font-bold hover:bg-primary/30 cursor-pointer'
                            : 'hover:bg-accent cursor-pointer'
                    }`}
                  >
                    {day.date > 0 ? day.date : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sessions List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent text-xl font-semibold mb-4">Upcoming Sessions</h2>
            
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                Loading sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="bg-gradient-to-r from-primary via-accent to-accent/80 bg-clip-text text-transparent text-lg font-medium mb-2">No sessions scheduled</h3>
                <p className="text-sm">Start learning or teaching by booking your first session</p>
              </div>
            ) : (
              sessions.map((session, i) => {
                const isTeacher = session.teacher_id === session.teacher?.id;
                const partner = isTeacher ? session.learner : session.teacher;
                const sessionType = isTeacher ? 'teaching' : 'learning';
                const skillName = session.skill?.name || 'Skill Session';
                
                // Format date and time
                const formatDate = (dateString: string) => {
                  const date = new Date(dateString);
                  return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                  });
                };
                
                const formatTime = (dateString: string) => {
                  const date = new Date(dateString);
                  return date.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  });
                };
                
                return (
                  <div 
                    key={session.id} 
                    className="card-hover p-5 border border-border bg-elevated animate-[fade-in-up_0.4s_ease-out_forwards]"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          sessionType === 'teaching' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          <Calendar className="h-6 w-6 flex-shrink-0" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              sessionType === 'teaching' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {sessionType === 'teaching' ? 'Teaching' : 'Learning'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              session.status === 'completed' ? 'bg-gray-50 text-gray-700 border border-gray-200' :
                              session.status === 'in_progress' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                              'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {session.status === 'completed' ? 'Completed' :
                               session.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
                            </span>
                          </div>
                          <h4 className="text-lg font-semibold">{skillName}</h4>
                          <p className="text-muted-foreground text-sm">with <span className="font-medium">{partner?.name || 'Unknown'}</span></p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:items-end gap-1 text-sm bg-surface p-3 rounded-lg border border-border">
                        {session.scheduled_at && (
                          <>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="font-medium">{formatDate(session.scheduled_at)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span>{formatTime(session.scheduled_at)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-4 border-t border-border mt-4">
                      {session.status === 'scheduled' && (
                        <button className="btn-primary flex-1 sm:flex-none py-2 px-4 text-sm">
                          <Video className="mr-2 h-4 w-4 flex-shrink-0" /> Join Call
                        </button>
                      )}
                      <button className="btn-secondary flex-1 sm:flex-none py-2 px-4 text-sm">
                        Reschedule
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
      
      {/* Meeting Modal */}
      <MeetingModal
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        onSubmit={handleMeetingSubmit}
      />
    </>
  );
}
