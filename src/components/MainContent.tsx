import React from 'react';
import TaskBoard from './TaskBoard/TaskBoard';

interface MainContentProps {
  selectedItem?: string | null;
}

const MainContent: React.FC<MainContentProps> = ({ selectedItem }) => {
  return (
    <div className="flex-1 bg-gray-900 flex flex-col">
      {/* Breadcrumb/Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Dashboard</span>
            <svg className="w-4 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">Vista General</span>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors px-3 py-1 text-sm border border-gray-600 rounded hover:border-gray-500">
            ← Atrás
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedItem === 'tasks' ? (
          <TaskBoard />
        ) : selectedItem ? (
          // Content when an item is selected (other than tasks)
          <div className="h-full">
            <h2 className="text-2xl font-bold text-white mb-6">
              Contenido de: {selectedItem}
            </h2>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <p className="text-gray-400">
                Aquí se mostrará el contenido específico para "{selectedItem}".
                Por ahora es un placeholder hasta que implementemos las secciones del menú.
              </p>
            </div>
          </div>
        ) : (
          // Empty state placeholder
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              {/* Icon */}
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white mb-3">
                Bienvenido a Axon Dashboard
              </h2>

              {/* Description */}
              <p className="text-gray-400 mb-6 leading-relaxed">
              </p>

              {/* Quick Actions */}
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Crear Nuevo Proyecto</span>
                  </div>
                </button>
                
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Abrir Mensajes</span>
                  </div>
                </button>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">6</div>
                  <div className="text-sm text-gray-400">Proyectos Activos</div>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">23</div>
                  <div className="text-sm text-gray-400">Tareas Pendientes</div>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">15</div>
                  <div className="text-sm text-gray-400">Mensajes Sin Leer</div>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">4</div>
                  <div className="text-sm text-gray-400">Reuniones Hoy</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainContent; 