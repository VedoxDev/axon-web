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
  brand?: string; // Adding brand information
}

const mockEvents: Event[] = [
  { 
    id: '1', 
    title: 'Nike - Presentación de nueva colección', 
    type: 'type1', 
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 10),
    brand: 'Nike'
  },
  { 
    id: '2', 
    title: 'Adidas - Reunión de estrategia Q3', 
    type: 'type2', 
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 10),
    brand: 'Adidas'
  },
  { 
    id: '3', 
    title: 'Apple - Revisión de campaña publicitaria', 
    type: 'type1', 
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 13),
    brand: 'Apple'
  },
  { 
    id: '4', 
    title: 'Samsung - Planificación de lanzamiento', 
    type: 'type2', 
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 13),
    brand: 'Samsung'
  },
  { 
    id: '5', 
    title: 'Microsoft - Demo de nuevas features', 
    type: 'type1', 
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
    brand: 'Microsoft'
  },
  { 
    id: '6', 
    title: 'Google - Reunión de análisis de mercado', 
    type: 'type2', 
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
    brand: 'Google'
  },
  { 
    id: '7', 
    title: 'Amazon - Presentación de resultados Q2', 
    type: 'type1', 
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 20),
    brand: 'Amazon'
  },
  { 
    id: '8', 
    title: 'Tesla - Reunión de innovación', 
    type: 'type2', 
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 20),
    brand: 'Tesla'
  },
  { 
    id: '9', 
    title: 'Meta - Estrategia de redes sociales', 
    type: 'type1', 
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
    brand: 'Meta'
  },
  { 
    id: '10', 
    title: 'Spotify - Planificación de contenido', 
    type: 'type2', 
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
    brand: 'Spotify'
  }
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
          className={`aspect-square bg-[#282828] rounded-md border border-gray-700 p-1 flex flex-col ${
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
    <div className="flex flex-col h-full bg-[#151718] text-white overflow-y-auto">
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
        <div className="flex flex-col w-full lg:w-1/2 flex-shrink-0 bg-[#282828] border border-gray-700 rounded-lg p-4 shadow-lg h-[550px]">
          <h3 className="text-lg font-semibold mb-4 text-white">Eventos</h3>

          {/* Event Search and Filter */}
          <div className="mb-4 space-y-3">
            <input
              type="text"
              placeholder="Buscar Evento"
              className="w-full bg-[#282828] text-white placeholder-gray-400 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <select className="w-full bg-[#2D2D2D] text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Todos los Eventos</option>
              <option>Reuniones</option>
              <option>Presentaciones</option>
              <option>Otros</option>
            </select>
          </div>

          {/* Event List (Scrollable) */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            <div className="text-sm font-medium text-white mb-2">Lista</div>
            {mockEvents
              .filter(event => isSameMonth(event.date, currentDate))
              .map(event => (
                <div
                  key={event.id}
                  className={`bg-[#121212] rounded-md p-3 border-l-4 hover:bg-gray-600 transition-colors duration-200 ${
                    event.type === 'type1' ? 'border-orange-500' : 'border-blue-500'
                  }`}
                >
                  <div className="font-medium text-white">{event.title}</div>
                  <div className="text-sm text-gray-300">
                    {format(event.date, 'd MMMM, yyyy', { locale: es })}
                  </div>
                  {event.brand && (
                    <div className="text-xs text-gray-400 mt-1 flex items-center">
                      <span className="mr-1">🏢</span>
                      {event.brand}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;