import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO, isAfter, isBefore, addMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import callsService, { type Meeting } from '../../services/callsService';
import projectService from '../../services/projectService';
import taskService, { type Task } from '../../services/taskService';
import { useAlert } from '../../hooks/useAlert';
import CreateMeetingModal from './CreateMeetingModal';
import VideoCallScreen from '../VideoCall/VideoCallScreen';

interface PersonalCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'waiting' | 'active' | 'ended' | 'cancelled' | 'task';
  meetingType?: 'project_meeting' | 'personal_meeting';
  canJoin?: boolean;
  meeting?: Meeting;
  task?: Task & { project?: { id: string; name: string } };
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'todo' | 'in_progress' | 'done';
}

const PersonalCalendarModal: React.FC<PersonalCalendarModalProps> = ({ isOpen, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
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

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  // Load projects first (required for task loading)
  const loadProjects = async () => {
    try {
      const projectsData = await projectService.getUserProjects();
      console.log('🏠 Loaded user projects:', projectsData.length, 'projects');
      setProjects(projectsData);
      return projectsData;
    } catch (error) {
      console.error('Failed to load projects:', error);
      throw new Error('No se pudieron cargar los proyectos');
    }
  };

  // Load personal meetings (all meetings user is invited to)
  const loadMeetings = async () => {
    try {
      console.log('🏠 Loading personal meetings...');
      const meetingsData = await callsService.getMyMeetings();
      console.log('✅ Loaded', meetingsData.length, 'personal meetings');
      
      setMeetings(meetingsData);
      
      // Log status breakdown for debugging
      const statusCounts = meetingsData.reduce((acc, meeting) => {
        acc[meeting.status || 'unknown'] = (acc[meeting.status || 'unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('📊 Meeting status breakdown:', statusCounts);
      
      return meetingsData;
    } catch (error: any) {
      console.error('Failed to load meetings:', error);
      throw new Error('No se pudieron cargar las reuniones');
    }
  };

  // Load tasks (personal + all project tasks)
  const loadTasks = async () => {
    try {
      // 1. Load personal tasks
      const personalTasks = await taskService.getPersonalTasks();
      console.log('📋 Personal tasks loaded:', personalTasks.length, 'tasks');
      
      // 2. Load tasks from ALL projects and annotate them with project info
      const projectTasksWithProjectInfo = [];
      for (const project of projects) {
        const projectTasks = await taskService.getProjectTasks(project.id);
        
        // Add project info to each task if it's missing
        const annotatedTasks = projectTasks.map(task => ({
          ...task,
          project: (task as any).project || { id: project.id, name: project.name }
        } as Task & { project?: { id: string; name: string } }));
        
        projectTasksWithProjectInfo.push(...annotatedTasks);
      }
      console.log('📁 Project tasks loaded:', projectTasksWithProjectInfo.length, 'tasks');
      
      // 3. Combine all tasks
      const allTasks = [...personalTasks, ...projectTasksWithProjectInfo];
      
      // 4. Filter tasks that have due dates (CRITICAL FOR CALENDAR)
      const tasksWithDueDates = allTasks.filter(task => task.dueDate);
      console.log('📋 Loaded', tasksWithDueDates.length, 'tasks with due dates out of', allTasks.length, 'total tasks');
      
      setTasks(tasksWithDueDates);
      return tasksWithDueDates;
    } catch (error: any) {
      console.error('Failed to load tasks:', error);
      throw new Error('No se pudieron cargar las tareas');
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

  // Complete data loading flow
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Load projects first (required for task loading)
      await loadProjects(); // Load projects for future use
      
      // Then load meetings and tasks in parallel
      await Promise.all([
        loadMeetings(),
        loadTasks(),
        loadCurrentUser()
      ]);
      
    } catch (error: any) {
      console.error('Failed to load initial data:', error);
      showError(error.message || 'Error al cargar los datos del calendario', 'Error');
    } finally {
      setIsLoading(false);
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
    return '#F59E0B'; // Orange for medium/default
  };

  // Get status information for meetings
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { text: 'En curso', color: '#FFFFFF', bgColor: '#007AFF', icon: '📹' };
      case 'waiting':
        return { text: 'Programada', color: '#FFFFFF', bgColor: '#FF9500', icon: '⏱️' };
      case 'ended':
        return { text: 'Finalizada', color: '#FFFFFF', bgColor: '#6B7280', icon: '✅' };
      case 'cancelled':
        return { text: 'Cancelada', color: '#FFFFFF', bgColor: '#6B7280', icon: '❌' };
      default:
        return { text: 'Desconocido', color: '#FFFFFF', bgColor: '#6B7280', icon: '❓' };
    }
  };

  // Get status information for tasks
  const getTaskStatusInfo = (task: Task) => {
    if (task.status === 'done') {
      return { text: 'Completada', color: '#FFFFFF', bgColor: '#10B981', icon: '✅' };
    } else if (task.priority === 'critical') {
      return { text: 'Crítica', color: '#FFFFFF', bgColor: '#7C3AED', icon: '🚨' };
    } else if (task.priority === 'high') {
      return { text: 'Alta', color: '#FFFFFF', bgColor: '#EF4444', icon: '🔴' };
    } else if (task.priority === 'low') {
      return { text: 'Baja', color: '#FFFFFF', bgColor: '#10B981', icon: '🟢' };
    }
    return { text: 'Media', color: '#FFFFFF', bgColor: '#F59E0B', icon: '🟡' };
  };

  // Month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Event filtering
  const getFilteredEvents = (): CalendarEvent[] => {
    const allEvents = getCalendarEvents();
    
    return allEvents.filter(event => {
      // Status filter
      if (statusFilter === 'all') {
        // Show all events
      } else if (statusFilter === 'waiting' && event.type !== 'waiting') {
        return false;
      } else if (statusFilter === 'active' && event.type !== 'active') {
        return false;
      } else if (statusFilter === 'ended' && event.type !== 'ended') {
        return false;
      } else if (statusFilter === 'cancelled' && event.type !== 'cancelled') {
        return false;
      }

      // Time filter
      if (timeFilter === 'past' && isAfter(event.date, today)) {
        return false;
      } else if (timeFilter === 'today' && !isSameDay(event.date, today)) {
        return false;
      } else if (timeFilter === 'upcoming' && isBefore(event.date, today)) {
        return false;
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
    const filteredEvents = getFilteredEvents();
    return filteredEvents.filter(event => isSameDay(event.date, day));
  };

  // Handle meeting actions
  const handleJoinMeeting = async (meetingId: string) => {
    try {
      setIsConnectedToCall(true);
      
      const response = await callsService.joinMeeting(meetingId, false);
      
      console.log('📞 Joining meeting:', response);
      showSuccess('Conectando a la reunión...', '🎥');
      
      setActiveCallId(meetingId);
      
    } catch (error: any) {
      console.error('Failed to join meeting:', error);
      
      if (error.message && error.message.includes('call-has-ended')) {
        showError('Esta reunión ya ha finalizado. Actualizando lista...', '⏰');
        loadMeetings();
      } else if (error.message && error.message.includes('call not found')) {
        showError('Esta reunión no existe o ya ha finalizado. Actualizando lista...', '🔍');
        loadMeetings();
      } else if (error.message && error.message.includes('unauthorized')) {
        showError('No tienes permisos para unirte a esta reunión', '🚫');
      } else {
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
      await loadMeetings();
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
    loadMeetings();
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

      // Determine which event types are present on this day
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

  // Get displayed events (for selected date or current month)
  const getDisplayedEvents = (): CalendarEvent[] => {
    const filteredEvents = getFilteredEvents();
    
    if (selectedDate) {
      return filteredEvents.filter(event => isSameDay(event.date, selectedDate));
    } else {
      return filteredEvents.filter(event => isSameMonth(event.date, currentDate));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-[#151718] rounded-lg w-full max-w-7xl h-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
          
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-white">Mi Calendario Personal</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateMeeting}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Reunión
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white p-2 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Cargando calendario personal...</p>
              </div>
            </div>
          ) : (
            /* Main content area: Calendar and Events side-by-side */
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden lg:space-x-6 p-4 lg:p-6 h-full">
              {/* Calendar Section */}
              <div className="flex flex-col w-full lg:w-1/2 flex-shrink-0 overflow-y-auto lg:pr-3 mb-6 lg:mb-0">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 rounded-full text-gray-400 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-base lg:text-lg font-semibold text-white">
                    {format(currentDate, 'MMMM yyyy', { locale: es })}
                  </span>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 rounded-full text-gray-400 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Days of the week header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                    <div key={day} className="text-xs font-medium text-gray-400 text-center py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 flex-1">
                  {renderCalendarGrid()}
                </div>

                {/* Legend */}
                <div className="mt-4 p-3 bg-[#1F2937] rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">Leyenda</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-gray-300">Reunión activa</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-gray-300">Reunión programada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      <span className="text-gray-300">Reunión finalizada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-gray-300">Reunión cancelada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-300">Tarea completada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="text-gray-300">Tarea crítica</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Events List Section */}
              <div className="flex flex-col w-full lg:w-1/2 overflow-hidden">
                {/* Events Header with Filters */}
                <div className="flex flex-col space-y-3 mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedDate ? `Eventos del ${format(selectedDate, 'd MMMM yyyy', { locale: es })}` : 'Eventos del mes'}
                  </h3>
                  
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar eventos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#282828] border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    />
                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="bg-[#282828] border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="waiting">Programados</option>
                      <option value="active">Activos</option>
                      <option value="ended">Finalizados</option>
                      <option value="cancelled">Cancelados</option>
                    </select>

                    <select
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value as any)}
                      className="bg-[#282828] border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="all">Todos los tiempos</option>
                      <option value="past">Pasados</option>
                      <option value="today">Hoy</option>
                      <option value="upcoming">Próximos</option>
                    </select>

                    {selectedDate && (
                      <button
                        onClick={() => setSelectedDate(null)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200"
                      >
                        Ver mes completo
                      </button>
                    )}
                  </div>
                </div>

                {/* Events List */}
                <div className="flex-1 overflow-y-auto space-y-3">
                  {getDisplayedEvents().length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📅</div>
                      <p className="text-gray-400">No hay eventos para mostrar</p>
                    </div>
                  ) : (
                    getDisplayedEvents().map((event) => {
                      const isTask = event.type === 'task';
                      const eventDate = event.date; 
                      const statusInfo = isTask ? getTaskStatusInfo(event.task!) : getStatusInfo(event.type);

                      return (
                        <div
                          key={event.id}
                          className="bg-[#1F2937] rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors duration-200"
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
          )}
        </div>
      </div>

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onMeetingCreated={handleMeetingCreated}
      />

      {/* Video Call Screen */}
      {activeCallId && (
        <VideoCallScreen
          callId={activeCallId}
          onClose={handleCallClose}
        />
      )}
    </>
  );
};

export default PersonalCalendarModal; 