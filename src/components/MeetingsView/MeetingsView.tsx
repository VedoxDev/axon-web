import React from 'react';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status?: 'completed'; // Optional status for badges
}

interface MeetingSection {
  title: string;
  meetings: Meeting[];
}



const mockMeetingsData: MeetingSection[] = [
  {
    title: 'Próximas Reuniones',
    meetings: [
      {
        id: 'upc-1',
        title: 'Revisión de Sprint',
        date: '12 Dec',
        time: '10:00 AM',
        location: 'Video-Calling',
      },
      {
        id: 'upc-2',
        title: 'Base de datos Relacional',
        date: '15 Dec',
        time: '15:00 AM',
        location: 'In-Person',
      },
      {
        id: 'upc-2',
        title: 'Base de datos Relacional',
        date: '15 Dec',
        time: '15:00 AM',
        location: 'In-Person',
      },
    ],
  },
  {
    title: 'Reuniones Pasadas',
    meetings: [
      {
        id: 'past-1',
        title: 'Base de datos Relacional',
        date: '12 Dec',
        time: '12:00 AM',
        location: 'In-Person',
        status: 'completed',
      },
      {
        id: 'past-2',
        title: 'Base de datos Relacional',
        date: '12 Dec',
        time: '16:00 AM',
        location: 'In-Person',
        status: 'completed',
      },
      {
        id: 'upc-2',
        title: 'Base de datos Relacional',
        date: '15 Dec',
        time: '15:00 AM',
        location: 'In-Person',
        status: 'completed'
      },
    ],
  },
];

const MeetingsView: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#151718] text-white overflow-y-auto ">

      {/* Meeting Sections (Scrollable) */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 ">
        {mockMeetingsData.map((section) => (
          <div key={section.title} className="bg-[#2D2D2D] border border-gray-700 rounded-lg p-4 shadow-lg ">
            <h3 className="text-lg font-semibold mb-4 text-white">{section.title}</h3>
            <div className="space-y-4">
              {section.meetings.map((meeting) => (
                <div 
                  key={meeting.id} 
                  className={`bg-[#151718] rounded-md p-3 flex items-center justify-between ${section.title === 'Reuniones Pasadas' ? 'opacity-60' : ''}`} // Apply opacity based on section title
                >
                  <div className="flex-1">
                    <div className="text-base font-medium text-blue-400">{meeting.title}</div>
                    <div className="text-sm text-gray-300">{meeting.date}, {meeting.time}</div>
                    <div className="text-sm text-gray-400">{meeting.location}</div>
                  </div>
                  {meeting.status === 'completed' && (
                    <span className="ml-4 px-2 py-1 bg-orange-600 text-white text-xs font-semibold rounded-full">Completed</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingsView; 