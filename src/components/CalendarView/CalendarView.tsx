import React, { useState } from 'react';
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
  getDate
} from 'date-fns';
import { es } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  type: 'type1' | 'type2'; // To differentiate styling (left border color and dot color)
  date: Date;
}

const mockEvents: Event[] = [
  { id: '1', title: 'Reunión de equipo', type: 'type1', date: new Date(2024, 5, 10) }, // June 10th, 2024
  { id: '2', title: 'Presentación de proyecto', type: 'type2', date: new Date(2024, 5, 10) }, // June 10th, 2024
  { id: '3', title: 'Almuerzo con cliente', type: 'type1', date: new Date(2024, 5, 13) }, // June 13th, 2024
  { id: '4', title: 'Planificación semanal', type: 'type2', date: new Date(2024, 5, 13) }, // June 13th, 2024
  { id: '5', title: 'Revisión de código', type: 'type1', date: new Date(2024, 6, 5) }, // July 5th, 2024
  { id: '6', title: 'Demo Features', type: 'type2', date: new Date(2024, 6, 15) }, // July 15th, 2024
  { id: '7', title: 'Meeting with Stakeholders', type: 'type1', date: new Date(2024, 4, 28) }, // May 28th, 2024
];

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

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

  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return days.map((day, index) => {
      const isCurrentMonth = isSameMonth(day, currentDate);
      const isCurrentDay = isToday(day);
      const dayEvents = mockEvents.filter(event => isSameDay(event.date, day));

      // Determine which event types are present on this day
      const eventTypes = new Set(dayEvents.map(event => event.type));

      return (
        <div
          key={index}
          className={`aspect-square bg-gray-800 rounded-md border border-gray-700 p-1 flex flex-col ${
            !isCurrentMonth ? 'opacity-40' : ''
          } ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className="w-full flex justify-end text-sm">{format(day, 'd')}</div>
          {eventTypes.size > 0 && (
            <div className="flex justify-center mt-1 space-x-1 flex-grow items-center">
              {eventTypes.has('type1') && <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>}
              {eventTypes.has('type2') && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
              {/* Add more dot types here if needed */}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-900 text-white overflow-y-auto">
      {/* Main content area: Calendar and Events side-by-side */}
      <div className="flex flex-1 overflow-hidden space-x-6">
        {/* Calendar Section */}
        <div className="flex flex-col w-1/2 flex-shrink-0 overflow-y-auto pr-3">
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
            <span className="text-lg font-semibold">
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
        </div>

        {/* Eventos Section */}
        <div className="flex flex-col w-140 flex-shrink-0 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg h-full">
          <h3 className="text-lg font-semibold mb-4 text-white flex-shrink-0">Eventos</h3>

          {/* Event Search and Filter */}
          <div className="mb-4 space-y-3 flex-shrink-0">
            <input
              type="text"
              placeholder="Buscar Evento"
              className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Todos los Eventos</option>
              <option>Reuniones</option>
              <option>Presentaciones</option>
              <option>Otros</option>
            </select>
          </div>

          {/* Event List (Scrollable) */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            <div className="text-sm font-medium text-white mb-2">Lista</div>
            {mockEvents
              .filter(event => isSameMonth(event.date, currentDate))
              .map(event => (
                <div
                  key={event.id}
                  className={`bg-gray-700 rounded-md p-3 border-l-4 ${
                    event.type === 'type1' ? 'border-orange-500' : 'border-blue-500'
                  }`}
                >
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm text-gray-400">
                    {format(event.date, 'd MMMM, yyyy', { locale: es })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;