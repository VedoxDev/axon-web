import React from 'react';

interface Project {
  id: string;
  name: string;
  avatar: string;
  unreadCount?: number;
  color?: string;
}

interface SidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onProjectSelect: (projectId: string) => void;
  onAddProject: () => void;
  layout?: 'vertical' | 'horizontal';
}

const Sidebar: React.FC<SidebarProps> = ({ 
  projects, 
  activeProjectId, 
  onProjectSelect, 
  onAddProject,
  layout = 'horizontal'
}) => {
  const getProjectColor = (project: Project) => {
    if (project.color) return project.color;
    
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-orange-500'
    ];
    return colors[parseInt(project.id) % colors.length];
  };

  if (layout === 'horizontal') {
    return (
      <div className="bg-gray-900 p-6">
        <h2 className="text-white text-lg font-semibold mb-4">Tus proyectos</h2>
        <div className="flex flex-wrap gap-4">
          {projects.map((project) => (
            <div key={project.id} className="relative group">
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 ${
                  project.avatar ? 'overflow-hidden' : getProjectColor(project)
                } ${
                  activeProjectId === project.id ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
                }`}
                onClick={() => onProjectSelect(project.id)}
              >
                {project.avatar ? (
                  <img src={project.avatar} alt={project.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-xl">
                    {project.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {project.unreadCount && project.unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                  {project.unreadCount > 9 ? '9+' : project.unreadCount}
                </div>
              )}
              
              {/* Tooltip */}
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {project.name}
              </div>
            </div>
          ))}

          {/* Add Project Button */}
          <div className="relative group">
            <div 
              className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 hover:border-gray-400 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105"
              onClick={onAddProject}
            >
              <svg className="w-8 h-8 text-gray-600 hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            
            {/* Tooltip */}
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Agregar Proyecto
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vertical layout (original Discord-style)
  return (
    <div className="w-20 bg-gray-900 flex flex-col items-center py-3 space-y-2 h-full">
      {/* Home/Dashboard */}
      <div className="relative group">
        <div 
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center cursor-pointer transition-all duration-200 hover:rounded-xl ${
            activeProjectId === null ? 'rounded-xl' : ''
          }`}
          onClick={() => onProjectSelect('')}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m8 10 4 4 4-4" />
          </svg>
        </div>
        {activeProjectId === null && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full -ml-2" />
        )}
      </div>

      {/* Separator */}
      <div className="w-8 h-0.5 bg-gray-700 rounded-full" />

      {/* Project Icons */}
      {projects.map((project) => (
        <div key={project.id} className="relative group">
          <div 
            className={`w-12 h-12 rounded-2xl ${getProjectColor(project)} flex items-center justify-center cursor-pointer transition-all duration-200 hover:rounded-xl overflow-hidden ${
              activeProjectId === project.id ? 'rounded-xl' : ''
            }`}
            onClick={() => onProjectSelect(project.id)}
          >
            {project.avatar ? (
              <img src={project.avatar} alt={project.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-semibold text-lg">
                {project.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {project.unreadCount && project.unreadCount > 0 && (
            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {project.unreadCount > 9 ? '9+' : project.unreadCount}
            </div>
          )}
          {activeProjectId === project.id && (
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full -ml-2" />
          )}
          
          {/* Tooltip */}
          <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {project.name}
          </div>
        </div>
      ))}

      {/* Add Project Button */}
      <div className="relative group">
        <div 
          className="w-12 h-12 rounded-2xl bg-gray-700 hover:bg-green-600 flex items-center justify-center cursor-pointer transition-all duration-200 hover:rounded-xl"
          onClick={onAddProject}
        >
          <svg className="w-6 h-6 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        
        {/* Tooltip */}
        <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          Agregar Proyecto
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 