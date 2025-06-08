import React from 'react';

interface Announcement {
  id: string;
  name: string;
  text: string;
  timestamp: string;
  type: 'type1' | 'type2'; // To differentiate styling (border color)
}

const mockAnnouncements: Announcement[] = [
  {
    id: 'ann1',
    name: 'Richard L.',
    text: 'El Sprint de esta semana comenzará este martes, estaros atentos 🚩',
    timestamp: '2024-06-10 09:00',
    type: 'type1', // Orange border
  },
  {
    id: 'ann2',
    name: 'Susan M.',
    text: 'Jose R. tenemos que hablar sobre ellos los estilos del footer 🚩',
    timestamp: '2024-06-10 09:00',
    type: 'type2', // Blue border
  },
   {
    id: 'ann3',
    name: 'Richard L.',
    text: 'El Sprint de esta semana comenzará este martes, estaros atentos 🚩',
    timestamp: '2024-06-10 09:00',
    type: 'type1', // Orange border
  },
  {
    id: 'ann4',
    name: 'Susan M.',
    text: 'Jose R. tenemos que hablar sobre ellos los estilos del footer 🚩',
    timestamp: '2024-06-10 09:00',
    type: 'type2', // Blue border
  },
  {
    id: 'ann4',
    name: 'Susan M.',
    text: 'Jose R. tenemos que hablar sobre ellos los estilos del footer 🚩',
    timestamp: '2024-06-10 09:00',
    type: 'type2', // Blue border
  },
  {
    id: 'ann4',
    name: 'Susan M.',
    text: 'Jose R. tenemos que hablar sobre ellos los estilos del footer 🚩',
    timestamp: '2024-06-10 09:00',
    type: 'type2', // Blue border
  },
  
];

const AnnouncementsView: React.FC = () => {
  return (
    <div className="flex flex-col h-135 bg-gray-900 text-white border border-orange-700">

    {/* Scrollable List Container */}
    <div className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-4">
      {mockAnnouncements.map((announcement) => (
        <div
          key={announcement.id}
          className={`bg-gray-800 rounded-lg p-4 shadow-lg border-l-4 ${
            announcement.type === 'type1' ? 'border-orange-500' : 'border-blue-500'
          }`}
        >
          <div className="text-base font-semibold text-white mb-1">
            {announcement.name}
          </div>
          <div className="text-sm text-gray-300 mb-2">{announcement.text}</div>
          <div className="text-xs text-gray-500">{announcement.timestamp}</div>
        </div>
      ))}
    </div>
  </div>
  );
};

export default AnnouncementsView; 