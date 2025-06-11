import React from 'react';
import type { ChatMessage } from '../services/chatService';

interface CallInvitationModalProps {
  isOpen: boolean;
  message: ChatMessage | null;
  onAccept: () => void;
  onDecline: () => void;
}

const CallInvitationModal: React.FC<CallInvitationModalProps> = ({
  isOpen,
  message,
  onAccept,
  onDecline
}) => {
  if (!isOpen || !message) return null;

  // Extract call type from message content
  const isVideoCall = message.content.includes('videollamada');
  const isAudioCall = message.content.includes('llamada de audio') || 
                     (message.content.includes('llamada') && !isVideoCall);
  
  // Get caller name
  const callerName = `${message.sender.nombre} ${message.sender.apellidos}`;
  
  // Determine call type and icon
  const callType = isVideoCall ? 'videollamada' : 'llamada de audio';
  const callIcon = isVideoCall ? '📹' : '📞';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{callIcon}</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            Invitación a {callType}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {callerName} te está invitando a una {callType}
          </p>
        </div>

        {/* Call Type Info */}
                 <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-6">
           <div className="flex items-center justify-center space-x-2">
             <span className="text-lg">{callIcon}</span>
             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
               {message.recipient ? 'Llamada directa' : 'Reunión de proyecto'}
             </span>
           </div>
          {isVideoCall && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
              Con video y audio
            </p>
          )}
          {isAudioCall && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
              Solo audio
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onDecline}
            className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={onAccept}
            className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors ${
              isVideoCall 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Aceptar
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {message.createdAt && new Date(message.createdAt).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CallInvitationModal; 