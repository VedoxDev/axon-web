import React, { useState } from 'react';
import FileCard from './FileCard.tsx';
import type { File } from './types.ts';

const mockFiles: File[] = [
  {
    id: '1',
    name: 'Budget 2024.xlsx',
    size: '3.1 MB',
    type: 'excel',
  },
  {
    id: '2',
    name: 'Design Mockups.png',
    size: '4.8 MB',
    type: 'png',
  },
  {
    id: '3',
    name: 'Meeting Notes.docx',
    size: '1.2 MB',
    type: 'docx',
  },
  {
    id: '4',
    name: 'Project Proposal.pdf',
    size: '2.4 MB',
    type: 'pdf',
  },
  {
    id: '5',
    name: 'Project Timeline.pptx',
    size: '5.6 MB',
    type: 'pptx',
  },
];

const fileTypes = ['Todos', 'PDF', 'Documentos', 'Imágenes', 'Presentaciones', 'Hojas de Cálculo'];

const FilesView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Todos');
  const [sortBy, setSortBy] = useState('Nombre');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Simple filtering logic (can be expanded)
  const filteredFiles = mockFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'Todos' || 
                        (selectedType === 'PDF' && file.type === 'pdf') ||
                        (selectedType === 'Documentos' && (file.type === 'docx' || file.type === 'pdf')) || // Simplified document filter
                        (selectedType === 'Imágenes' && file.type === 'png') ||
                        (selectedType === 'Presentaciones' && file.type === 'pptx') ||
                        (selectedType === 'Hojas de Cálculo' && file.type === 'excel');
    return matchesSearch && matchesType;
  });

  // Simple sorting logic (can be expanded)
  const sortedFiles = filteredFiles.sort((a, b) => {
    if (sortBy === 'Nombre') {
      return a.name.localeCompare(b.name);
    }
    // Add other sorting options if needed
    return 0;
  });

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar archivos..."
            className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Filters (Horizontal Scrollable) */}
        <div className="flex overflow-x-auto space-x-3 pb-2">
          {fileTypes.map(type => (
            <button
              key={type}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Sort and View Toggle */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Ordenar por:</span>
            <select
              className="bg-gray-700 text-white text-sm rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Nombre">Nombre</option>
              {/* Add other sorting options */}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2">
             {/* Grid View Button */}
            <button
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm0-6h4V4h-4v4zm6 6h4v-4h-4v4zm0-6h4V4h-4v4zm0 12h4v-4h-4v4z"/>
              </svg>
            </button>
            {/* List View Button */}
             <button
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
              }`}
              onClick={() => setViewMode('list')}
            >
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 14h16v-2H4v2zm0 5h16v-2H4v2zm0-10h16V7H4v2z"/>
                </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Files Grid/List (Scrollable) */}
      <div className="flex-1 overflow-y-auto pr-2">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedFiles.map(file => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        ) : (
           // List view implementation would go here
          <div className="text-center text-gray-400 mt-8">List view not implemented yet.</div>
        )}
      </div>
    </div>
  );
};

export default FilesView; 