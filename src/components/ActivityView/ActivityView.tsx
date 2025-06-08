import React, { useState } from 'react';

interface TaskItem {
  status: 'completed' | 'inProgress' | 'assigned'; // Using simplified statuses for dots
  title: string;
  timestamp: string;
  user: string;
}

interface TaskSection {
  title: string;
  tasks: TaskItem[];
}

const mockActivityData: TaskSection[] = [
  {
    title: 'This Week\'s Activity',
    tasks: [
      { status: 'completed', title: 'Design UI', timestamp: '2024-06-08 09:00', user: 'John Doe' },
      { status: 'completed', title: 'Implement Login', timestamp: '2024-06-07 14:30', user: 'Jane Smith' },
      { status: 'completed', title: 'Setup Database', timestamp: '2024-06-06 11:00', user: 'Mike Johnson' },
      { status: 'inProgress', title: 'Develop API', timestamp: '2024-06-08 10:00', user: 'Sarah Wilson' },
      { status: 'inProgress', title: 'Write Documentation', timestamp: '2024-06-08 11:30', user: 'Alex Brown' },
      { status: 'assigned', title: 'Write Documentation', timestamp: '2024-06-08 11:30', user: 'Alex Brown' },
      { status: 'assigned', title: 'Write Documentation', timestamp: '2024-06-08 11:30', user: 'Alex Brown' },
      { status: 'assigned', title: 'Write Documentation', timestamp: '2024-06-08 11:30', user: 'Alex Brown' },

    ],
  },
  {
    title: 'Last Week\'s Activity',
    tasks: [
      { status: 'completed', title: 'Initial Wireframes', timestamp: '2024-06-01 10:00', user: 'John Doe' },
      { status: 'completed', title: 'Project Proposal', timestamp: '2024-05-31 16:00', user: 'Jane Smith' },
      { status: 'completed', title: 'Team Meeting', timestamp: '2024-05-30 14:00', user: 'Mike Johnson' },
      { status: 'completed', title: 'Requirements Gathering', timestamp: '2024-05-29 11:00', user: 'Sarah Wilson' },
      { status: 'inProgress', title: 'Write Documentation', timestamp: '2024-06-08 11:30', user: 'Alex Brown' },
      { status: 'inProgress', title: 'Write Documentation', timestamp: '2024-06-08 11:30', user: 'Alex Brown' },
      { status: 'assigned', title: 'Write Documentation', timestamp: '2024-06-08 11:30', user: 'Alex Brown' },
      { status: 'assigned', title: 'Write Documentation', timestamp: '2024-06-08 11:30', user: 'Alex Brown' },

    ],
  },
];

const getStatusColor = (status: TaskItem['status']): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-500'; // Green dot
    case 'inProgress':
      return 'bg-orange-500'; // Orange dot
    case 'assigned':
      return 'bg-blue-500'; // Blue dot
    default:
      return 'bg-gray-500';
  }
};

const ActivityView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'completed' | 'inProgress' | 'assigned'>('completed');
  const completionPercentage = 43;

  const filteredSections = mockActivityData.filter(section => {
    return section.tasks.some(task => task.status === activeTab);
  });

  return (
    <div className="flex flex-col bg-gray-900 text-white border border-orange-700 ">
      <div>
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">{completionPercentage}% completed</div>
          <div className="w-full bg-gray-700 rounded-full h-5">
            <div 
              className="bg-blue-500 h-5 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-10 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-2 px-4 ${activeTab === 'completed' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-400 hover:text-white'}`}
        >
          Completed
        </button>
        <button
          onClick={() => setActiveTab('inProgress')}
          className={`pb-2 px-4 ${activeTab === 'inProgress' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-400 hover:text-white'}`}
        >
          In Progress
        </button>
        <button
          onClick={() => setActiveTab('assigned')}
          className={`pb-2 px-4 ${activeTab === 'assigned' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400 hover:text-white'}`}
        >
          Assigned
        </button>
      </div>

      {/* Task Sections (Scrollable) */}
      <div className="flex-1">
        <div className="flex space-x-6 min-w-max pb-4 h-100">
          {filteredSections.map((section, index) => (
            <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg flex-1 min-w-[500px] flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-white">{section.title}</h3>
              <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                <div className="space-y-3">
                  {section.tasks.map((task, taskIndex) => (
                    <div key={taskIndex} className="flex items-start space-x-3 p-2 hover:bg-gray-700 rounded-lg transition-colors">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)} flex-shrink-0 mt-2`}></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-300">{task.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          <span>{task.timestamp}</span>
                          <span className="mx-2">•</span>
                          <span className="text-blue-400">by {task.user}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4B5563;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6B7280;
        }
      `}</style>
    </div>
  );
};

export default ActivityView; 