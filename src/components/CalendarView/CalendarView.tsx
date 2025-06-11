import React, { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  differenceInMonths,
  addMinutes,
  isAfter,
  isBefore,
  parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import callsService, { type Meeting } from '../../services/callsService';
import projectService from '../../services/projectService';
import taskService, { type Task } from '../../services/taskService';
import { useAlert } from '../../hooks/useAlert';
import CreateMeetingModal from '../modals/CreateMeetingModal';
import VideoCallScreen from '../VideoCall/VideoCallScreen';

interface CalendarViewProps {
  projectId?: string; // If provided, shows project-specific meetings
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'waiting' | 'active' | 'ended' | 'cancelled' | 'task';
  meetingType?: 'project_meeting' | 'personal_meeting';
  canJoin?: boolean;
  meeting?: Meeting;
  task?: Task;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'todo' | 'in_progress' | 'done';
}

const CalendarView: React.FC<CalendarViewProps> = ({ projectId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'active' | 'ended' | 'cancelled'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'past' | 'today' | 'upcoming'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConnectedToCall, setIsConnectedToCall] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  
  const { showSuccess, showError } = useAlert();
  const today = new Date();

  // Load meetings, tasks and current user when component mounts or projectId changes
  useEffect(() => {
    loadMeetings();
    loadTasks();
    loadCurrentUser();
  }, [projectId]);

  const loadMeetings = async () => {
    try {
      setIsLoading(true);
      let meetingsData: Meeting[] = [];

      if (projectId) {
        // Load project-specific meetings (includes history)
        meetingsData = await callsService.getProjectMeetingHistory(projectId);
        console.log('📅 Loaded project meetings:', meetingsData.length, 'meetings for project', projectId);
      } else {
        // Load user's personal meetings
        meetingsData = await callsService.getMyMeetings();
        console.log('📅 Loaded personal meetings:', meetingsData.length, 'meetings');
      }

      setMeetings(meetingsData);
      
      // Log status breakdown for debugging
      const statusCounts = meetingsData.reduce((acc, meeting) => {
        acc[meeting.status || 'unknown'] = (acc[meeting.status || 'unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('📊 Meeting status breakdown:', statusCounts);
      
    } catch (error: any) {
      console.error('Failed to load meetings:', error);
      showError(error.message || 'Error al cargar reuniones', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      let tasksData: Task[] = [];
      
      if (projectId) {
        // For project calendar - get only project tasks
        tasksData = await taskService.getProjectTasks(projectId);
        console.log('📋 Loaded project tasks:', tasksData.length, 'tasks for project', projectId);
      } else {
        // For personal calendar - get both personal and all project tasks
        const personalTasks = await taskService.getPersonalTasks();
        const userProjects = await projectService.getUserProjects();
        const allProjectTasks = await Promise.all(
          userProjects.map(project => taskService.getProjectTasks(project.id))
        );
        const projectTasks = allProjectTasks.flat();
        tasksData = [...personalTasks, ...projectTasks];
        console.log('📋 Loaded all tasks:', {
          personal: personalTasks.length,
          projects: projectTasks.length,
          total: tasksData.length
        });
      }
      
      // Filter tasks that have due dates
      const tasksWithDueDates = tasksData.filter(task => task.dueDate);
      setTasks(tasksWithDueDates);
      
      console.log('📋 Tasks with due dates:', tasksWithDueDates.length);
      
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
      showError(error.message || 'Error al cargar tareas', 'Error');
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await projectService.getCurrentUser();
      setCurrentUserId(user.id);
    } catch (error: any) {
      console.error('Failed to load current user:', error);
    }
  };

  // Convert meetings and tasks to calendar events
  const getCalendarEvents = (): CalendarEvent[] => {
    // Convert meetings to calendar events
    const meetingEvents = meetings.map(meeting => {
      const meetingDate = parseISO(meeting.scheduledAt);
      const meetingEndTime = addMinutes(meetingDate, meeting.duration);
      const now = new Date();
      const fiveMinutesBefore = addMinutes(meetingDate, -5);

      // Determine if user can join the meeting
      const canJoin = (meeting.status === 'waiting' || meeting.status === 'active') && 
                      isAfter(now, fiveMinutesBefore) && 
                      isBefore(now, meetingEndTime);

      return {
        id: meeting.id,
        title: meeting.title,
        date: meetingDate,
        type: meeting.status || 'waiting',
        meetingType: meeting.meetingType,
        canJoin,
        meeting
      };
    });

    // Convert tasks to calendar events
    const taskEvents = tasks.map(task => {
      const taskDate = parseISO(task.dueDate!); // We know dueDate exists because we filtered

      return {
        id: `task-${task.id}`,
        title: task.title,
        date: taskDate,
        type: 'task' as const,
        priority: task.priority,
        status: task.status,
        task
      };
    });

    // Combine and return all events
    return [...meetingEvents, ...taskEvents];
  };

  // Get task color based on priority and status
  const getTaskColor = (task: Task) => {
    if (task.status === 'done') {
      return '#10B981'; // Green for completed
    } else if (task.priority === 'critical') {
      return '#7C3AED'; // Purple for critical
    } else if (task.priority === 'high') {
      return '#EF4444'; // Red for high
    } else if (task.priority === 'low') {
      return '#10B981'; // Green for low
    }
    return '#F59E0B'; // Default orange for medium priority
  };

  // Get status info for display (meetings)
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { 
          text: 'En curso', 
          color: '#007AFF',
          icon: '🔴',
          bgColor: 'rgba(0, 122, 255, 0.15)'
        };
      case 'ended':
        return { 
          text: 'Finalizada', 
          color: '#6B7280',
          icon: '✅',
          bgColor: 'rgba(107, 114, 128, 0.15)'
        };
      case 'cancelled':
        return { 
          text: 'Cancelada', 
          color: '#FF3B30',
          icon: '❌',
          bgColor: 'rgba(255, 59, 48, 0.15)'
        };
      default: // 'waiting'
        return { 
          text: 'Programada', 
          color: '#FFA500',
          icon: '⏰',
          bgColor: 'rgba(255, 165, 0, 0.15)'
        };
    }
  };

  // Get task status info for display
  const getTaskStatusInfo = (task: Task) => {
    const color = getTaskColor(task);
    
    switch (task.status) {
      case 'done':
        return {
          text: 'Completada',
          color,
          icon: '✅',
          bgColor: `${color}20`
        };
      case 'in_progress':
        return {
          text: 'En progreso',
          color,
          icon: '🔄',
          bgColor: `${color}20`
        };
      default: // 'todo'
        return {
          text: 'Pendiente',
          color,
          icon: '📋',
          bgColor: `${color}20`
        };
    }
  };

  // Check if navigation to a date is allowed (within 2 months range)
  const canNavigateToDate = (targetDate: Date): boolean => {
    const monthsDifference = differenceInMonths(targetDate, today);
    return Math.abs(monthsDifference) <= 2;
  };

  const goToPreviousMonth = () => {
    const newDate = subMonths(currentDate, 1);
    if (canNavigateToDate(newDate)) {
      setCurrentDate(newDate);
    }
  };

  const goToNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    if (canNavigateToDate(newDate)) {
      setCurrentDate(newDate);
    }
  };

  // Filter meetings based on search and filters
  const getFilteredMeetings = (): CalendarEvent[] => {
    const events = getCalendarEvents();
    
    return events.filter(event => {
      // Status filter
      if (statusFilter !== 'all' && event.type !== statusFilter) {
        return false;
      }
      
      // Time filter
      if (timeFilter !== 'all') {
        const eventDate = event.date;
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const tomorrowStart = new Date(todayStart.getTime() + 86400000);
        
        switch (timeFilter) {
          case 'past':
            return event.type === 'ended' || event.type === 'cancelled';
          case 'today':
            return eventDate >= todayStart && eventDate < tomorrowStart;
          case 'upcoming':
            return eventDate >= tomorrowStart && (event.type === 'waiting' || event.type === 'active');
          default:
            return true;
        }
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (event.type === 'task') {
          return event.title.toLowerCase().includes(query) ||
                 event.task?.description?.toLowerCase().includes(query);
        } else {
          return event.title.toLowerCase().includes(query) ||
                 event.meeting?.description?.toLowerCase().includes(query) ||
                 event.meeting?.initiator.nombre.toLowerCase().includes(query) ||
                 event.meeting?.initiator.apellidos.toLowerCase().includes(query);
        }
      }
      
      return true;
    });
  };

  // Get events for a specific day
  const getEventsForDay = (day: Date): CalendarEvent[] => {
    const filteredEvents = getFilteredMeetings();
    return filteredEvents.filter(event => isSameDay(event.date, day));
  };

  // Handle meeting actions
  const handleJoinMeeting = async (meetingId: string) => {
    try {
      setIsConnectedToCall(true);
      
      // Join the meeting using the callsService
      const response = await callsService.joinMeeting(meetingId, false);
      
      console.log('📞 Joining meeting:', response);
      showSuccess('Conectando a la reunión...', '🎥');
      
      // Set the active call ID to show the video call interface
      setActiveCallId(meetingId);
      
    } catch (error: any) {
      console.error('Failed to join meeting:', error);
      
      // Handle specific error cases
      if (error.message && error.message.includes('call-has-ended')) {
        showError('Esta reunión ya ha finalizado. Actualizando lista...', '⏰');
        // Refresh meetings data to update the UI
        loadMeetings();
      } else if (error.message && error.message.includes('call not found')) {
        showError('Esta reunión no existe o ya ha finalizado. Actualizando lista...', '🔍');
        // Refresh meetings data to update the UI
        loadMeetings();
      } else if (error.message && error.message.includes('unauthorized')) {
        showError('No tienes permisos para unirte a esta reunión', '🚫');
      } else {
        // Generic error message
        showError(error.message || 'Error al unirse a la reunión', 'Error');
      }
    } finally {
      setIsConnectedToCall(false);
    }
  };

  const handleCallClose = () => {
    setActiveCallId(null);
  };

  const handleCancelMeeting = async (meetingId: string) => {
    try {
      await callsService.cancelMeeting(meetingId);
      showSuccess('Reunión cancelada exitosamente', 'Éxito');
      await loadMeetings(); // Reload meetings
    } catch (error: any) {
      console.error('Failed to cancel meeting:', error);
      showError(error.message || 'Error al cancelar la reunión', 'Error');
    }
  };

  const handleCreateMeeting = () => {
    setIsCreateModalOpen(true);
  };

  const handleMeetingCreated = () => {
    setIsCreateModalOpen(false);
    loadMeetings(); // Reload meetings after creation
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return days.map((day, index) => {
      const isCurrentMonth = isSameMonth(day, currentDate);
      const isCurrentDay = isToday(day);
      const dayEvents = getEventsForDay(day);
      const isSelected = selectedDate && isSameDay(day, selectedDate);

      // Determine which meeting types are present on this day
      const eventStatuses = new Set(dayEvents.map(event => event.type));

      return (
        <div
          key={index}
          className={`aspect-square bg-[#282828] rounded-md border border-gray-700 p-1 flex flex-col cursor-pointer transition-all duration-200 hover:bg-[#333333] ${
            !isCurrentMonth ? 'opacity-40' : ''
          } ${isCurrentDay ? 'ring-2 ring-blue-500' : ''} ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
          onClick={() => setSelectedDate(day)}
        >
          <div className="w-full flex justify-end text-sm">{format(day, 'd')}</div>
          {eventStatuses.size > 0 && (
            <div className="flex justify-center mt-1 space-x-1 flex-grow items-center flex-wrap">
              {eventStatuses.has('active') && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
              {eventStatuses.has('waiting') && <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>}
              {eventStatuses.has('ended') && <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>}
              {eventStatuses.has('cancelled') && <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>}
              {eventStatuses.has('task') && (
                <div className="w-1.5 h-1.5 rounded-full" style={{ 
                  backgroundColor: dayEvents.find(e => e.type === 'task' && e.task)?.task ? 
                    getTaskColor(dayEvents.find(e => e.type === 'task' && e.task)!.task!) : '#F59E0B'
                }}></div>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  // Filter meetings for current month or selected date
  const getDisplayedMeetings = (): CalendarEvent[] => {
    const filteredEvents = getFilteredMeetings();
    
    if (selectedDate) {
      // Show meetings for selected date
      return filteredEvents.filter(event => isSameDay(event.date, selectedDate));
    } else {
      // Show meetings for current month
      return filteredEvents.filter(event => isSameMonth(event.date, currentDate));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-[#151718] text-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando calendario...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#151718] text-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">
          {projectId ? 'Calendario del Proyecto' : 'Mi Calendario'}
        </h1>
        <button
          onClick={handleCreateMeeting}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Reunión
        </button>
      </div>

      {/* Main content area: Calendar and Events side-by-side */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden lg:space-x-6 p-4 lg:p-6">
        {/* Calendar Section */}
        <div className="flex flex-col w-full lg:w-1/2 flex-shrink-0 overflow-y-auto lg:pr-3 mb-6 lg:mb-0">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className={`p-2 rounded-full ${
                canNavigateToDate(subMonths(currentDate, 1))
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
              disabled={!canNavigateToDate(subMonths(currentDate, 1))}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-base lg:text-lg font-semibold">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </span>
            <button
              onClick={goToNextMonth}
              className={`p-2 rounded-full ${
                canNavigateToDate(addMonths(currentDate, 1))
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
              disabled={!canNavigateToDate(addMonths(currentDate, 1))}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Selected Date Info */}
          {selectedDate && (
            <div className="mb-4 p-3 bg-[#282828] rounded-lg border border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-400">
                  {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: es })}
                </span>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-2">
            {['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'].map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarGrid()}
          </div>

          {/* Legend */}
          <div className="mt-4 p-3 bg-[#282828] rounded-lg border border-gray-600">
            <h4 className="text-sm font-medium text-white mb-2">Leyenda</h4>
            <div className="space-y-3">
              {/* Meetings */}
              <div>
                <h5 className="text-xs font-medium text-gray-400 mb-1">Reuniones</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-gray-300">En curso</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-gray-300">Programada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    <span className="text-gray-300">Finalizada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-gray-300">Cancelada</span>
                  </div>
                </div>
              </div>
              
              {/* Tasks */}
              <div>
                <h5 className="text-xs font-medium text-gray-400 mb-1">Tareas</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                    <span className="text-gray-300">Baja/Completada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#F59E0B]"></div>
                    <span className="text-gray-300">Media</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
                    <span className="text-gray-300">Alta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#7C3AED]"></div>
                    <span className="text-gray-300">Crítica</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="flex flex-col w-full lg:w-1/2 flex-shrink-0 bg-[#282828] border border-gray-700 rounded-lg p-4 shadow-lg h-[600px]">
          <h3 className="text-lg font-semibold mb-4 text-white">
            {selectedDate ? `Eventos - ${format(selectedDate, 'd MMM', { locale: es })}` : 'Eventos'}
          </h3>

          {/* Filters */}
          <div className="mb-4 space-y-3">
            <input
              type="text"
              placeholder="Buscar reunión..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1A1A] text-white placeholder-gray-400 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="flex space-x-2">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex-1 bg-[#1A1A1A] text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Todos los estados</option>
                <option value="waiting">Programadas</option>
                <option value="active">En curso</option>
                <option value="ended">Finalizadas</option>
                <option value="cancelled">Canceladas</option>
              </select>
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="flex-1 bg-[#1A1A1A] text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Todos los tiempos</option>
                <option value="past">Pasadas</option>
                <option value="today">Hoy</option>
                <option value="upcoming">Próximas</option>
              </select>
            </div>
          </div>

          {/* Meetings List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {getDisplayedMeetings().length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-400">No hay reuniones para mostrar</p>
                <button
                  onClick={handleCreateMeeting}
                  className="mt-2 text-orange-400 hover:text-orange-300 text-sm"
                >
                  Crear nueva reunión
                </button>
              </div>
            ) : (
              getDisplayedMeetings().map(event => {
                const isTask = event.type === 'task';
                const statusInfo = isTask ? getTaskStatusInfo(event.task!) : getStatusInfo(event.type);
                const eventDate = event.date;
                
                return (
                  <div
                    key={event.id}
                    className="bg-[#1A1A1A] rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors duration-200"
                    style={{ opacity: event.type === 'ended' || event.type === 'cancelled' || (isTask && event.status === 'done') ? 0.7 : 1 }}
                  >
                    {/* Event Header */}
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white text-sm">{event.title}</h4>
                      <div 
                        className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                        style={{ 
                          backgroundColor: statusInfo.bgColor,
                          color: statusInfo.color 
                        }}
                      >
                        <span>{statusInfo.icon}</span>
                        <span>{statusInfo.text}</span>
                      </div>
                    </div>

                    {/* Event Details */}
                    {isTask ? (
                      /* Task Details */
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Vence: {format(eventDate, 'HH:mm')}</span>
                          <span className="capitalize">({event.priority} prioridad)</span>
                        </div>
                        
                        {event.task?.assignedTo && event.task.assignedTo.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Asignado: {event.task.assignedTo.map(u => u.name).join(', ')}</span>
                          </div>
                        )}

                        {event.task?.section && (
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span>Sección: {event.task.section}</span>
                          </div>
                        )}

                        {event.task?.description && (
                          <p className="text-xs text-gray-400 mt-1">{event.task.description}</p>
                        )}

                        {event.task?.labels && event.task.labels.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {event.task.labels.map(label => (
                              <span
                                key={label.id}
                                className="px-1.5 py-0.5 rounded text-xs"
                                style={{ backgroundColor: `${label.color}20`, color: label.color }}
                              >
                                {label.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Meeting Details */
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {event.meeting && (
                            <>
                              <span>{format(eventDate, 'HH:mm')} - {format(addMinutes(eventDate, event.meeting.duration), 'HH:mm')}</span>
                              <span>({event.meeting.duration} min)</span>
                            </>
                          )}
                        </div>
                        
                        {event.meeting && (
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>{event.meeting.initiator.nombre} {event.meeting.initiator.apellidos}</span>
                          </div>
                        )}

                        {event.meeting?.project && (
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>{event.meeting.project.name}</span>
                          </div>
                        )}

                        {event.meeting?.description && (
                          <p className="text-xs text-gray-400 mt-1">{event.meeting.description}</p>
                        )}
                      </div>
                    )}

                    {/* Event Actions */}
                    <div className="flex items-center gap-2">
                      {!isTask && event.canJoin && (
                        <button
                          onClick={() => handleJoinMeeting(event.id)}
                          disabled={isConnectedToCall}
                          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium py-1 px-3 rounded transition-colors duration-200 flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {isConnectedToCall ? 'Conectando...' : 'Unirse'}
                        </button>
                      )}
                      
                      <button
                        className="text-gray-400 hover:text-white text-xs py-1 px-2 rounded transition-colors duration-200"
                        onClick={() => {
                          if (isTask) {
                            console.log('Show task details:', event.task);
                          } else {
                            console.log('Show meeting details:', event.meeting);
                          }
                        }}
                      >
                        Detalles
                      </button>

                      {!isTask && event.meeting && event.meeting.initiator.id === currentUserId && event.type === 'waiting' && (
                        <button
                          onClick={() => handleCancelMeeting(event.id)}
                          className="text-red-400 hover:text-red-300 text-xs py-1 px-2 rounded transition-colors duration-200"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onMeetingCreated={handleMeetingCreated}
        projectId={projectId}
      />

      {/* Video Call Screen */}
      {activeCallId && (
        <VideoCallScreen
          callId={activeCallId}
          onClose={handleCallClose}
        />
      )}
    </div>
  );
};

export default CalendarView;