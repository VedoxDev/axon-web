import React from 'react';
import type { File } from './types';

interface FileCardProps {
  file: File;
}

// Helper to get icon based on file type
const getFileIcon = (fileType: File['type']) => {
  switch (fileType) {
    case 'excel':
      return (
        <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21.41 11.41l-2.83-2.83C18.21 8.21 18 8 17.59 8H12V3.59C12 3.04 11.55 3 11 3H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-5.59c0-.41-.21-.62-.59-1zM10 17H7v-2h3v2zm0-4H7v-2h3v2zm0-4H7V7h3v2zm4 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V7h3v2zm5 1.38L17.59 10 16 11.59V13h2v-1.41l1.41-1.41c.18-.18.4-.29.62-.29.22 0 .44.11.62.29l.79.79c.36.36.36.92 0 1.28L18.38 14 20 15.62V17h2v-1.62z"/>
        </svg>
      );
    case 'png':
      return (
         <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.88l-3.49 4.5c-.31.4-.01.95.48.95h7c.5 0 .81-.56.49-.98l-4-5.5c-.32-.45-.9-.45-1.22 0zM15 9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
          </svg>
      );
    case 'docx':
      return (
        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-2 16H8v-1h4v1zm0-3H8v-1h4v1zm0-3H8v-1h4v1zm4-8v4h-4V2h4z"/>
        </svg>
      );
    case 'pdf':
      return (
        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-2 18H8v-2h4v2zm0-4H8v-2h4v2zm0-4H8v-2h4v2zm6-4v4h-4V2h4z"/>
        </svg>
      );
    case 'pptx':
      return (
         <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-2 18H8v-1h4v1zm0-2H8v-1h4v1zm-1-7.21c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l1.41 1.41c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.41-1.41zM15 18h-2v-1h2v1zm1-4V8l-4-4H6v16h12V14h-2z"/>
          </svg>
      );
    default:
      return (
        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/>
        </svg>
      );
  }
};

const FileCard: React.FC<FileCardProps> = ({ file }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg flex flex-col items-start space-y-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-700 flex-shrink-0">
        {getFileIcon(file.type)}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-white truncate w-full">{file.name}</div>
        <div className="text-xs text-gray-400">{file.size}</div>
      </div>
    </div>
  );
};

export default FileCard; 