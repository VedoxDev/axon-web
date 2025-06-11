import React, { useState } from 'react';
import { useAlert } from '../hooks/useAlert';
import callsService from '../services/callsService';
import type { Conversation } from '../services/chatService';

interface CallButtonsProps {
  conversation: Conversation;
  onCallStarted: (callId: string) => void;
  className?: string;
}

const CallButtons: React.FC<CallButtonsProps> = ({ conversation, onCallStarted, className = '' }) => {
  const { showError, showSuccess } = useAlert();
  const [isStartingCall, setIsStartingCall] = useState(false);

  const startCall = async (audioOnly: boolean) => {
    if (isStartingCall) return;

    try {
      setIsStartingCall(true);

      let callRequest;
      let callDescription;

      if (conversation.type === 'direct' && conversation.partner) {
        // Direct call (1:1) - support both audio and video
        callRequest = {
          type: 'direct' as const,
          recipientId: conversation.partner.id,
          title: audioOnly ? 'Llamada de audio' : 'Videollamada',
          audioOnly
        };
        callDescription = audioOnly 
          ? `Iniciando llamada de audio con ${conversation.partner.nombre} ${conversation.partner.apellidos}...`
          : `Iniciando videollamada con ${conversation.partner.nombre} ${conversation.partner.apellidos}...`;
      } else if (conversation.type === 'project' && conversation.project) {
        // Project call (group) - only video calls for projects
        callRequest = {
          type: 'project' as const,
          projectId: conversation.project.id,
          title: `Reunión de ${conversation.project.name}`,
          audioOnly: false // Projects always use video
        };
        callDescription = `Iniciando videollamada del proyecto ${conversation.project.name}...`;
      } else {
        throw new Error('Conversación inválida para iniciar llamada');
      }

      showSuccess(callDescription, '📞');

      // Start the call
      const { call } = await callsService.startCall(callRequest);
      
      console.log('Call started:', call);
      showSuccess('Llamada iniciada exitosamente', '🎥');

      // Notify parent component
      onCallStarted(call.id);

    } catch (error: any) {
      console.error('Failed to start call:', error);
      showError(error.message || 'Error al iniciar la llamada', 'Error');
    } finally {
      setIsStartingCall(false);
    }
  };

  const handleAudioCall = () => {
    startCall(true);
  };

  const handleVideoCall = () => {
    startCall(false);
  };

  // Don't show buttons if conversation is not valid
  if (!conversation || (!conversation.partner && !conversation.project)) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Audio Call Button - Only for direct conversations */}
      {conversation.type === 'direct' && (
        <button
          onClick={handleAudioCall}
          disabled={isStartingCall}
          className="p-2 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white transition-colors group"
          title="Llamada de audio"
        >
          {isStartingCall ? (
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          )}
        </button>
      )}

      {/* Video Call Button */}
      <button
        onClick={handleVideoCall}
        disabled={isStartingCall}
        className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white transition-colors group"
        title={conversation.type === 'direct' ? 'Videollamada' : 'Reunión de proyecto'}
      >
        {isStartingCall ? (
          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>


    </div>
  );
};

export default CallButtons; 